let extensionState = {
  isEnabled: true,
  stats: {
    totalBannersIntercepted: 0,
    totalWarningsShown: 0,
    totalAccepted: 0,
    totalRejected: 0,
    totalCustomized: 0,
    sitesProtected: new Set()
  },
  events: []
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Privacy Pulse] Extension installed');

    chrome.storage.local.set({
      isEnabled: true,
      stats: {
        totalBannersIntercepted: 0,
        totalWarningsShown: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalCustomized: 0,
        sitesProtected: []
      }
    });
  } else if (details.reason === 'update') {
    console.log('[Privacy Pulse] Extension updated to version', chrome.runtime.getManifest().version);
  }

  try {
    chrome.contextMenus.create({
      id: 'privacy-pulse-analyze',
      title: 'Analyze Privacy on This Page',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'privacy-pulse-clear-pref',
      title: 'Clear Saved Preference for This Site',
      contexts: ['page']
    });
  } catch (e) {
    console.log('[Privacy Pulse] Context menus not available:', e.message);
  }
});

chrome.runtime.onStartup.addListener(() => {
  loadExtensionState();
});

async function loadExtensionState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isEnabled', 'stats'], (result) => {
      if (result.isEnabled !== undefined) {
        extensionState.isEnabled = result.isEnabled;
      }
      if (result.stats) {
        extensionState.stats = {
          ...result.stats,
          sitesProtected: new Set(result.stats.sitesProtected || [])
        };
      }
      console.log('[Privacy Pulse] State loaded:', extensionState);
      resolve();
    });
  });
}

async function saveExtensionState() {
  return new Promise((resolve) => {
    const stateToSave = {
      isEnabled: extensionState.isEnabled,
      stats: {
        ...extensionState.stats,
        sitesProtected: Array.from(extensionState.stats.sitesProtected)
      }
    };

    chrome.storage.local.set(stateToSave, () => {
      console.log('[Privacy Pulse] State saved');
      resolve();
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Privacy Pulse] Message received:', message.type);

  switch (message.type) {
    case 'event':
      handleEvent(message, sender);
      sendResponse({ success: true });
      break;

    case 'analytics':
      handleAnalytics(message, sender);
      sendResponse({ success: true });
      break;

    case 'getState':
      sendResponse({
        isEnabled: extensionState.isEnabled,
        stats: {
          ...extensionState.stats,
          sitesProtected: Array.from(extensionState.stats.sitesProtected)
        }
      });
      break;

    case 'toggleEnabled':
      extensionState.isEnabled = !extensionState.isEnabled;
      saveExtensionState();
      sendResponse({ isEnabled: extensionState.isEnabled });
      break;

    case 'clearStats':
      extensionState.stats = {
        totalBannersIntercepted: 0,
        totalWarningsShown: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalCustomized: 0,
        sitesProtected: new Set()
      };
      saveExtensionState();
      sendResponse({ success: true });
      break;

    case 'getEvents':
      sendResponse({ events: extensionState.events.slice(-100) });
      break;

    case 'getSiteCookies':
      if (message.domain) {
        // Get cookies from multiple domain variations to capture all related cookies
        getSiteCookiesComprehensive(message.domain).then((cookies) => {
          sendResponse({ cookies: cookies });
        });
        return true;
      } else {
        sendResponse({ cookies: [] });
      }
      break;

    case 'clearPreferences':
      clearAllPreferences().then(() => {
        sendResponse({ success: true });
      });
      return true;

    case 'blockCookie':
      if (message.cookieName && message.url) {
        blockCookieByName(message.cookieName, message.domain, message.url).then((result) => {
          sendResponse(result);
        });
        return true;
      } else {
        sendResponse({ success: false, error: 'Missing cookie name or URL' });
      }
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return false;
});

function handleEvent(message, sender) {
  const event = {
    type: message.event,
    data: message.data,
    url: message.url,
    timestamp: message.timestamp,
    tabId: sender.tab?.id
  };

  extensionState.events.push(event);

  if (extensionState.events.length > 1000) {
    extensionState.events = extensionState.events.slice(-1000);
  }

  const domain = new URL(message.url).hostname;

  switch (message.event) {
    case 'banner_intercepted':
      extensionState.stats.totalBannersIntercepted++;
      extensionState.stats.sitesProtected.add(domain);
      updateBadge(sender.tab?.id, 'intercepted');
      showNotification('Banner Intercepted', `Cookie banner detected on ${domain}`);
      break;

    case 'warning_shown':
      extensionState.stats.totalWarningsShown++;
      updateBadge(sender.tab?.id, 'warning');
      break;

    case 'user_accepted':
      extensionState.stats.totalAccepted++;
      updateBadge(sender.tab?.id, 'accepted');
      break;

    case 'user_rejected':
      extensionState.stats.totalRejected++;
      updateBadge(sender.tab?.id, 'rejected');
      showNotification('Cookies Rejected', `You rejected tracking cookies on ${domain}`);
      break;

    case 'user_customize':
      extensionState.stats.totalCustomized++;
      updateBadge(sender.tab?.id, 'customized');
      break;
  }

  saveExtensionState();
}

function handleAnalytics(message, sender) {
  const event = {
    type: 'analytics',
    event: message.event,
    data: message.data,
    url: message.url,
    timestamp: message.timestamp,
    tabId: sender.tab?.id
  };

  extensionState.events.push(event);

  console.log('[Privacy Pulse] Analytics:', message.event, message.data);
}

function updateBadge(tabId, status) {
  if (!tabId) return;

  const badges = {
    intercepted: { text: '!', color: '#FFA500' },
    warning: { text: '!', color: '#FF6B6B' },
    accepted: { text: '✓', color: '#4CAF50' },
    rejected: { text: '✗', color: '#2196F3' },
    customized: { text: '⚙', color: '#9C27B0' }
  };

  const badge = badges[status] || { text: '', color: '#666666' };

  chrome.action.setBadgeText({ text: badge.text, tabId: tabId }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId: tabId }).catch(() => {});
}

function showNotification(title, message) {
  console.log('[Privacy Pulse] Notification:', title, message);
}

async function clearAllPreferences() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const keysToRemove = Object.keys(items).filter(key => key.startsWith('pref_'));

      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          console.log('[Privacy Pulse] Cleared', keysToRemove.length, 'preferences');
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

async function getSiteCookiesComprehensive(domain) {
  const allCookies = new Map();

  // Extract base domain (e.g., youtube.com from www.youtube.com)
  const parts = domain.split('.');
  const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

  // Domain variations to query
  const domainVariations = [
    domain,                    // www.youtube.com
    '.' + domain,              // .www.youtube.com
    baseDomain,                // youtube.com
    '.' + baseDomain,          // .youtube.com
  ];

  // For Google properties, also check google.com
  const googleDomains = ['youtube.com', 'google.com', 'googleapis.com', 'gstatic.com'];
  if (googleDomains.some(d => domain.includes(d))) {
    domainVariations.push('google.com', '.google.com');
  }

  // Query each domain variation
  for (const domainVar of domainVariations) {
    try {
      const cookies = await chrome.cookies.getAll({ domain: domainVar });
      cookies.forEach(cookie => {
        // Use name+domain as unique key to avoid duplicates
        const key = `${cookie.name}::${cookie.domain}`;
        if (!allCookies.has(key)) {
          allCookies.set(key, cookie);
        }
      });
    } catch (e) {
      // Domain variation might not exist
    }
  }

  // Also get cookies by URL for the current page
  try {
    const urlCookies = await chrome.cookies.getAll({ url: `https://${domain}` });
    urlCookies.forEach(cookie => {
      const key = `${cookie.name}::${cookie.domain}`;
      if (!allCookies.has(key)) {
        allCookies.set(key, cookie);
      }
    });
  } catch (e) {
    // URL query might fail
  }

  return Array.from(allCookies.values());
}

async function blockCookieByName(cookieName, domain, url) {
  try {
    // Get all cookies matching this name and domain
    const cookieQuery = { name: cookieName };
    if (domain) {
      cookieQuery.domain = domain;
    }
    const cookies = await chrome.cookies.getAll(cookieQuery);

    let blocked = 0;
    for (const cookie of cookies) {
      // Build the URL for cookie removal
      const protocol = cookie.secure ? 'https://' : 'http://';
      const cookieUrl = protocol + cookie.domain.replace(/^\./, '') + cookie.path;

      try {
        await chrome.cookies.remove({
          url: cookieUrl,
          name: cookie.name
        });
        blocked++;
        console.log('[Privacy Pulse] Blocked cookie:', cookie.name, 'from', cookie.domain);
      } catch (e) {
        console.log('[Privacy Pulse] Could not remove cookie:', cookie.name, e.message);
      }
    }

    // Also try with the specific URL provided
    if (url) {
      try {
        await chrome.cookies.remove({
          url: url,
          name: cookieName
        });
        blocked++;
      } catch (e) {
        // Cookie might not exist at this URL
      }
    }

    return { success: true, blocked: blocked };
  } catch (e) {
    console.error('[Privacy Pulse] Error blocking cookie:', e);
    return { success: false, error: e.message };
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId: tabId }).catch(() => {});
  }
});

setInterval(() => {
  saveExtensionState();
}, 5 * 60 * 1000);

if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab || !tab.id) return;
    if (info.menuItemId === 'privacy-pulse-analyze') {
      chrome.tabs.sendMessage(tab.id, { type: 'forceAnalysis' }).catch(() => {});
    } else if (info.menuItemId === 'privacy-pulse-clear-pref') {
      if (!tab.url) return;
      const domain = new URL(tab.url).hostname;
      chrome.storage.local.remove([`pref_${domain}`], () => {
        showNotification('Preference Cleared', `Saved preference for ${domain} has been cleared`);
        chrome.tabs.reload(tab.id).catch(() => {});
      });
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.isEnabled) {
      extensionState.isEnabled = changes.isEnabled.newValue;
      console.log('[Privacy Pulse] Enabled state changed:', extensionState.isEnabled);
    }
  }
});

loadExtensionState();

console.log('[Privacy Pulse Guardian] Background service worker initialized');
