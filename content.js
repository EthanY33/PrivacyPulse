(function() {
  'use strict';

  if (window.privacyPulseGuardianInjected) {
    return;
  }
  window.privacyPulseGuardianInjected = true;

  const detector = new CookieDetector();
  const warningModal = new WarningModal();

  let bannerInfo = null;
  let originalAcceptHandler = null;
  let isIntercepted = false;
  let userPreference = null;

  async function initialize() {
    try {
      await loadUserPreferences();

      if (userPreference && userPreference !== 'ask') {
        console.log('[Privacy Pulse] User preference loaded:', userPreference);
        return;
      }

      detectBannerWithRetry();
      observeDOMChanges();
    } catch (error) {
      console.error('[Privacy Pulse] Initialization error:', error);
    }
  }

  async function loadUserPreferences() {
    if (window.location.protocol === 'file:') {
      userPreference = 'ask';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const domain = window.location.hostname;
      chrome.storage.local.get([`pref_${domain}`], (result) => {
        userPreference = result[`pref_${domain}`] || 'ask';
        resolve();
      });
    });
  }

  async function saveUserPreference(preference) {
    if (window.location.protocol === 'file:') {
      console.log('[Privacy Pulse] Skipping preference save for local file');
      userPreference = 'ask';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const domain = window.location.hostname;
      chrome.storage.local.set({ [`pref_${domain}`]: preference }, () => {
        userPreference = preference;
        resolve();
      });
    });
  }

  function detectBannerWithRetry() {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 500;

    const detectInterval = setInterval(() => {
      attempts++;

      bannerInfo = detector.detectBanner();

      if (bannerInfo) {
        console.log('[Privacy Pulse] Cookie banner detected:', bannerInfo.platform);
        clearInterval(detectInterval);
        interceptBanner();
      } else if (attempts >= maxAttempts) {
        clearInterval(detectInterval);
        console.log('[Privacy Pulse] No cookie banner detected after', maxAttempts, 'attempts');
      }
    }, interval);
  }

  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      if (isIntercepted) return;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          bannerInfo = detector.detectBanner();
          if (bannerInfo) {
            console.log('[Privacy Pulse] Dynamically loaded banner detected');
            observer.disconnect();
            interceptBanner();
            break;
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => observer.disconnect(), 30000);
  }

  function interceptBanner() {
    if (!bannerInfo || !bannerInfo.acceptButton) {
      console.log('[Privacy Pulse] No accept button found to intercept');
      return;
    }

    isIntercepted = true;

    const acceptButton = bannerInfo.acceptButton;

    const interceptEvent = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log('[Privacy Pulse] Accept button click intercepted');

      showWarningModal();

      return false;
    };

    acceptButton.addEventListener('click', interceptEvent, true);
    acceptButton.addEventListener('mousedown', interceptEvent, true);
    acceptButton.addEventListener('touchstart', interceptEvent, true);

    originalAcceptHandler = () => {
      acceptButton.removeEventListener('click', interceptEvent, true);
      acceptButton.removeEventListener('mousedown', interceptEvent, true);
      acceptButton.removeEventListener('touchstart', interceptEvent, true);

      acceptButton.click();
    };

    addVisualIndicator(acceptButton);

    notifyBackgroundScript('banner_intercepted', {
      platform: bannerInfo.platform,
      domain: window.location.hostname
    });
  }

  function addVisualIndicator(button) {
    const indicator = document.createElement('span');
    indicator.className = 'ppg-intercepted-indicator';
    indicator.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span>Protected</span>
    `;

    button.style.position = 'relative';
    button.appendChild(indicator);
  }

  async function showWarningModal() {
    try {
      const cookieData = detector.analyzeCookies();
      const trackers = detector.detectTrackers();
      const privacyScore = detector.calculatePrivacyScore(cookieData, trackers);

      const data = {
        cookieData,
        trackers,
        privacyScore,
        platform: bannerInfo.platform,
        domain: window.location.hostname
      };

      warningModal.show(
        data,
        () => handleAcceptAnyway(),
        () => handleReject(),
        () => handleCustomize()
      );

      notifyBackgroundScript('warning_shown', data);

    } catch (error) {
      console.error('[Privacy Pulse] Error showing warning modal:', error);
      if (originalAcceptHandler) {
        originalAcceptHandler();
      }
    }
  }

  function handleAcceptAnyway() {
    console.log('[Privacy Pulse] User chose to accept anyway');

    saveUserPreference('accepted');

    if (originalAcceptHandler) {
      originalAcceptHandler();
    }

    notifyBackgroundScript('user_accepted', {
      domain: window.location.hostname
    });
  }

  function handleReject() {
    console.log('[Privacy Pulse] User chose to reject all');

    saveUserPreference('rejected');

    const rejectButton = findRejectButton();

    if (rejectButton) {
      rejectButton.click();
      console.log('[Privacy Pulse] Reject button clicked');
    } else {
      if (bannerInfo && bannerInfo.element) {
        bannerInfo.element.style.display = 'none';
        console.log('[Privacy Pulse] Banner hidden');
      }

      clearNonEssentialCookies();
    }

    notifyBackgroundScript('user_rejected', {
      domain: window.location.hostname
    });
  }

  function handleCustomize() {
    console.log('[Privacy Pulse] User chose to customize');

    const customizeButton = findCustomizeButton();

    if (customizeButton) {
      customizeButton.click();
      console.log('[Privacy Pulse] Customize button clicked');
    } else {
      console.log('[Privacy Pulse] No customize button found, showing original banner');
    }

    notifyBackgroundScript('user_customize', {
      domain: window.location.hostname
    });
  }

  function findRejectButton() {
    if (!bannerInfo || !bannerInfo.element) return null;

    const rejectSelectors = [
      'button[class*="reject" i]',
      'button[class*="decline" i]',
      'button[id*="reject" i]',
      'a[class*="reject" i]',
      '.onetrust-reject-all-handler',
      '#onetrust-reject-all-handler',
      'button:contains("Reject")',
      'button:contains("Decline")'
    ];

    for (const selector of rejectSelectors) {
      try {
        const button = bannerInfo.element.querySelector(selector);
        if (button) return button;
      } catch (e) {
      }
    }

    const buttons = bannerInfo.element.querySelectorAll('button, a[role="button"]');
    for (const button of buttons) {
      const text = button.textContent.toLowerCase();
      if (text.includes('reject') || text.includes('decline') || text.includes('deny')) {
        return button;
      }
    }

    return null;
  }

  function findCustomizeButton() {
    if (!bannerInfo || !bannerInfo.element) return null;

    const customizeSelectors = [
      'button[class*="settings" i]',
      'button[class*="customize" i]',
      'button[class*="preferences" i]',
      'button[class*="manage" i]',
      'button[id*="settings" i]',
      '.onetrust-pc-btn-handler',
      '#onetrust-pc-btn-handler'
    ];

    for (const selector of customizeSelectors) {
      try {
        const button = bannerInfo.element.querySelector(selector);
        if (button) return button;
      } catch (e) {
      }
    }

    const buttons = bannerInfo.element.querySelectorAll('button, a[role="button"]');
    for (const button of buttons) {
      const text = button.textContent.toLowerCase();
      if (text.includes('settings') || text.includes('customize') ||
          text.includes('preferences') || text.includes('manage')) {
        return button;
      }
    }

    return null;
  }

  function clearNonEssentialCookies() {
    const cookies = document.cookie.split(';');
    const essentialPatterns = ['session', 'csrf', 'auth', 'login', 'user'];

    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      const isEssential = essentialPatterns.some(pattern =>
        name.toLowerCase().includes(pattern)
      );

      if (!isEssential) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    }

    console.log('[Privacy Pulse] Non-essential cookies cleared');
  }

  function notifyBackgroundScript(event, data = {}) {
    try {
      chrome.runtime.sendMessage({
        type: 'event',
        event: event,
        data: data,
        url: window.location.href,
        timestamp: Date.now()
      });
    } catch (e) {
      console.debug('[Privacy Pulse] Failed to notify background:', e);
    }
  }

  async function viewCurrentSiteData() {
    try {
      const domain = window.location.hostname;

      const response = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'getSiteCookies', domain: domain }, resolve);
      });

      const allCookies = response && response.cookies ? response.cookies : null;

      const cookieData = detector.analyzeCookies(allCookies);
      const trackers = detector.detectTrackers();
      const privacyScore = detector.calculatePrivacyScore(cookieData, trackers);

      const data = {
        cookieData,
        trackers,
        privacyScore,
        platform: 'current',
        domain: domain,
        rawCookies: allCookies
      };

      const modal = new (window.WarningModal || WarningModal)();
      modal.show(
        data,
        () => {
          modal.hide();
        },
        () => {
          modal.hide();
        },
        () => {
          modal.hide();
        },
        true
      );
    } catch (e) {
      console.error('[Privacy Pulse] Error viewing site data:', e);
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getBannerInfo') {
      sendResponse({
        hasBanner: !!bannerInfo,
        isIntercepted: isIntercepted,
        platform: bannerInfo?.platform,
        userPreference: userPreference
      });
    } else if (message.type === 'clearPreference') {
      saveUserPreference('ask').then(() => {
        sendResponse({ success: true });
      });
      return true;
    } else if (message.type === 'viewSiteData') {
      viewCurrentSiteData();
      sendResponse({ success: true });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  console.log('[Privacy Pulse Guardian] Content script loaded');

})();
