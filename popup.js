let toggleEnabled;
let siteDomain;
let bannerStatus;
let statIntercepted;
let statRejected;
let btnClearPreference;
let btnClearAllPreferences;
let loadingEl;
let contentEl;

let currentTab = null;
let extensionState = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing...');

  try {
    toggleEnabled = document.getElementById('toggleEnabled');
    siteDomain = document.getElementById('siteDomain');
    bannerStatus = document.getElementById('bannerStatus');
    statIntercepted = document.getElementById('statIntercepted');
    statRejected = document.getElementById('statRejected');
    
    const btnViewSiteData = document.getElementById('btnViewSiteData');
    if (btnViewSiteData) {
      btnViewSiteData.addEventListener('click', handleViewSiteData);
    }
    
    btnClearPreference = document.getElementById('btnClearPreference');
    btnClearAllPreferences = document.getElementById('btnClearAllPreferences');
    loadingEl = document.getElementById('loading');
    contentEl = document.getElementById('content');

    console.log('[Popup] DOM elements loaded');

    if (toggleEnabled) toggleEnabled.addEventListener('change', handleToggleEnabled);
    if (btnClearPreference) btnClearPreference.addEventListener('click', handleClearPreference);
    if (btnClearAllPreferences) btnClearAllPreferences.addEventListener('click', handleClearAllPreferences);

    const linkHelp = document.getElementById('linkHelp');
    if (linkHelp) {
      linkHelp.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
      });
    }

    const linkAbout = document.getElementById('linkAbout');
    if (linkAbout) {
      linkAbout.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL('about.html') });
      });
    }

    console.log('[Popup] Event listeners attached');

    try {
        await Promise.race([
          loadData(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
    } catch (err) {
        console.error('[Popup] Load error or timeout:', err);
    }
    
    console.log('[Popup] Data loaded');

  } catch (error) {
    console.error('[Popup] Initialization error:', error);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    console.log('[Popup] UI displayed');
  }
});

async function loadData() {
  try {
    console.log('[Popup] Loading data...');

    let tabs;
    try {
      tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    } catch (e) {
      console.log('[Popup] Could not query tabs');
      return;
    }

    currentTab = tabs && tabs[0] ? tabs[0] : null;

    if (!currentTab || !currentTab.id) {
       console.log('[Popup] No active tab found');
       if (siteDomain) siteDomain.textContent = 'Unknown';
       if (bannerStatus) bannerStatus.textContent = 'No active tab';
       return;
    }

    if (currentTab.url) {
      try {
        const url = new URL(currentTab.url);
        if (siteDomain) siteDomain.textContent = url.hostname;
        console.log('[Popup] Current domain:', url.hostname);

        if (url.protocol === 'http:' || url.protocol === 'https:') {
          try {
            const response = await new Promise((resolve) => {
              try {
                chrome.tabs.sendMessage(currentTab.id, { type: 'getBannerInfo' }, (response) => {
                  if (chrome.runtime.lastError) {
                    resolve(null);
                  } else {
                    resolve(response);
                  }
                });
              } catch (e) {
                resolve(null);
              }
            });

            if (bannerStatus) {
              if (response && response.hasBanner) {
                bannerStatus.textContent = `✓ Banner detected (${response.platform})`;
                bannerStatus.classList.add('detected');

                if (response.isIntercepted) {
                  bannerStatus.textContent += ' - Protected!';
                }
              } else {
                bannerStatus.textContent = 'No banner detected';
              }

              if (response && response.userPreference && response.userPreference !== 'ask') {
                const prefText = response.userPreference === 'accepted' ? 'Accepted' :
                               response.userPreference === 'rejected' ? 'Rejected' : 'Customized';
                bannerStatus.textContent += ` (${prefText})`;
              }
            }
          } catch (e) {
            if (bannerStatus) bannerStatus.textContent = 'Scanning...';
          }
        } else {
          if (bannerStatus) bannerStatus.textContent = 'Not available on this page';
        }
      } catch (e) {
        if (siteDomain) siteDomain.textContent = 'Unknown';
        if (bannerStatus) bannerStatus.textContent = 'Invalid URL';
      }
    } else {
      if (siteDomain) siteDomain.textContent = 'Unknown';
      if (bannerStatus) bannerStatus.textContent = 'No URL';
    }

    try {
      extensionState = await new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
               if (chrome.runtime.lastError) {
                   resolve(null);
               } else {
                   resolve(response);
               }
          });
        } catch (e) {
          resolve(null);
        }
      });

      if (extensionState) {
        if (toggleEnabled) toggleEnabled.checked = extensionState.isEnabled;
        if (statIntercepted) statIntercepted.textContent = extensionState.stats.totalBannersIntercepted || 0;
        if (statRejected) statRejected.textContent = extensionState.stats.totalRejected || 0;
      }
    } catch (e) {
      if (toggleEnabled) toggleEnabled.checked = true;
      if (statIntercepted) statIntercepted.textContent = '0';
      if (statRejected) statRejected.textContent = '0';
    }

  } catch (error) {
    if (siteDomain) siteDomain.textContent = 'Error';
    if (bannerStatus) bannerStatus.textContent = 'Error loading data';
  }
}

async function handleToggleEnabled() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'toggleEnabled' });
    extensionState.isEnabled = response.isEnabled;

    showToast(response.isEnabled ? 'Protection enabled' : 'Protection disabled');

    if (currentTab && currentTab.id) {
      chrome.tabs.reload(currentTab.id).catch(() => {});
    }
  } catch (error) {
    showToast('Error updating settings');
    if (toggleEnabled) toggleEnabled.checked = !toggleEnabled.checked;
  }
}

async function handleViewSiteData() {
  if (!currentTab || !currentTab.url) {
    showToast('No active tab');
    return;
  }

  try {
    const url = new URL(currentTab.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      showToast('Not available on this page');
      return;
    }

    let tabs;
    try {
      tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    } catch (e) {
      showToast('Cannot access tab');
      return;
    }

    if (!tabs || !tabs[0] || !tabs[0].id) {
      showToast('Tab not available');
      return;
    }

    const tabId = tabs[0].id;

    const sendViewMessage = () => {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'viewSiteData' }, () => {
          if (chrome.runtime.lastError) {
            return;
          }
          window.close();
        });
      } catch (e) {
      }
    };

    const injectAndShow = async () => {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['cookie-detector.js', 'warning-modal.js', 'content.js']
        });
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['styles.css']
        });
        setTimeout(sendViewMessage, 150);
      } catch (e) {
        showToast('Cannot access this page');
      }
    };

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => window.privacyPulseGuardianInjected === true
      });
      if (results && results[0] && results[0].result) {
        sendViewMessage();
      } else {
        await injectAndShow();
      }
    } catch (e) {
      await injectAndShow();
    }
  } catch (error) {
    showToast('Error opening site data');
  }
}

async function handleClearPreference() {
  if (!currentTab || !currentTab.url) {
    showToast('No active tab');
    return;
  }

  try {
    const url = new URL(currentTab.url);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      showToast('Not available on this page');
      return;
    }

    if (confirm(`Clear saved preference for ${url.hostname}?`)) {
      const domain = url.hostname;
      await chrome.storage.local.remove([`pref_${domain}`]);

      showToast('Preference cleared');

      chrome.tabs.sendMessage(currentTab.id, { type: 'clearPreference' }, () => {
        if (chrome.runtime.lastError) { }
      });

      chrome.tabs.reload(currentTab.id).catch(() => {});
      setTimeout(() => window.close(), 1000);
    }
  } catch (error) {
    console.error('[Popup] Error clearing preference:', error);
    showToast('Error clearing preference');
  }
}

async function handleClearAllPreferences() {
  if (confirm('Clear all saved preferences for all websites? This cannot be undone.')) {
    try {
      await chrome.runtime.sendMessage({ type: 'clearPreferences' });
      showToast('All preferences cleared');
      await loadData();
    } catch (error) {
      console.error('[Popup] Error clearing preferences:', error);
      showToast('Error clearing preferences');
    }
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
`;
document.head.appendChild(style);

console.log('[Privacy Pulse] Popup script loaded');
