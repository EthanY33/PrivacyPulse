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

let blockedCookiesStore = new Map();

const connectedPorts = new Set();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      isEnabled: true,
      stats: {
        totalBannersIntercepted: 0,
        totalWarningsShown: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalCustomized: 0,
        sitesProtected: []
      },
      blockedCookies: {}
    });
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
  } catch (e) {}
});

chrome.runtime.onStartup.addListener(async () => {
  await loadExtensionState();
  await loadBlockedCookiesFromStorage();
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
      resolve();
    });
  });
}

async function loadBlockedCookiesFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['blockedCookies'], (result) => {
      blockedCookiesStore = new Map();
      if (result.blockedCookies) {
        for (const [domain, cookies] of Object.entries(result.blockedCookies)) {
          blockedCookiesStore.set(domain, new Map(Object.entries(cookies)));
        }
      }
      resolve();
    });
  });
}

async function persistBlockedCookies() {
  return new Promise((resolve) => {
    const serializable = {};
    for (const [domain, cookies] of blockedCookiesStore) {
      const nonIncognito = {};
      for (const [name, data] of cookies) {
        if (!data.incognito) {
          nonIncognito[name] = data;
        }
      }
      if (Object.keys(nonIncognito).length > 0) {
        serializable[domain] = nonIncognito;
      }
    }
    chrome.storage.local.set({ blockedCookies: serializable }, resolve);
  });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'privacy-pulse-ui') {
    connectedPorts.add(port);
    port.onDisconnect.addListener(() => {
      connectedPorts.delete(port);
    });
  }
});

async function broadcastToAllViews(message) {
  // Modal/UI views subscribe via chrome.runtime.connect (warning-modal.js
  // line 18) and receive port messages here. The previous tabs.query +
  // sendMessage broadcast was inert (content.js does not handle
  // `cookieBlockStateChanged`) but leaked the user's per-domain block
  // preferences to every open tab's content script — including pages on
  // unrelated origins. Scope the broadcast to the existing port set only.
  for (const port of connectedPorts) {
    try {
      port.postMessage(message);
    } catch (e) {
      connectedPorts.delete(port);
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
        const isIncognito = sender.tab?.incognito || false;
        getSiteCookiesComprehensive(message.domain, { incognito: isIncognito })
          .then((cookies) => sendResponse({ cookies }));
        return true;
      } else {
        sendResponse({ cookies: [] });
      }
      break;

    case 'getBlockedCookies':
      const domainBlocked = blockedCookiesStore.get(message.domain);
      sendResponse({
        blocked: domainBlocked ? Array.from(domainBlocked.keys()) : []
      });
      break;

    case 'isBlockedCookie':
      const domainSet = blockedCookiesStore.get(message.domain);
      sendResponse({
        isBlocked: domainSet ? domainSet.has(message.cookieName) : false
      });
      break;

    case 'clearPreferences':
      clearAllPreferences().then(() => sendResponse({ success: true }));
      return true;

    case 'blockCookie':
      if (message.cookieName && message.domain) {
        const isIncognito = sender.tab?.incognito || false;
        handleBlockCookie(message.cookieName, message.domain, message.url, isIncognito)
          .then((result) => sendResponse(result));
        return true;
      } else {
        sendResponse({ success: false, error: 'Missing cookie name or domain' });
      }
      break;

    case 'unblockCookie':
      if (message.cookieName && message.domain) {
        handleUnblockCookie(message.cookieName, message.domain)
          .then((result) => sendResponse(result));
        return true;
      } else {
        sendResponse({ success: false, error: 'Missing cookie name or domain' });
      }
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return false;
});

async function handleBlockCookie(cookieName, domain, url, isIncognito = false) {
  try {
    if (!blockedCookiesStore.has(domain)) {
      blockedCookiesStore.set(domain, new Map());
    }
    blockedCookiesStore.get(domain).set(cookieName, {
      timestamp: Date.now(),
      incognito: isIncognito
    });

    if (!isIncognito) {
      await persistBlockedCookies();
    }

    const result = await blockCookieByName(cookieName, domain, url);

    broadcastToAllViews({
      type: 'cookieBlockStateChanged',
      domain: domain,
      cookieName: cookieName,
      blocked: true,
      success: result.success
    });

    extensionState.stats.totalRejected++;
    await saveExtensionState();

    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function handleUnblockCookie(cookieName, domain) {
  try {
    const domainCookies = blockedCookiesStore.get(domain);
    if (domainCookies) {
      domainCookies.delete(cookieName);
      if (domainCookies.size === 0) {
        blockedCookiesStore.delete(domain);
      }
    }

    await persistBlockedCookies();

    broadcastToAllViews({
      type: 'cookieBlockStateChanged',
      domain: domain,
      cookieName: cookieName,
      blocked: false
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function blockCookieByName(cookieName, domain, url) {
  try {
    const cookieQuery = { name: cookieName };
    if (domain) {
      cookieQuery.domain = domain;
    }
    const cookies = await chrome.cookies.getAll(cookieQuery);

    let blocked = 0;
    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const cookieUrl = protocol + cookie.domain.replace(/^\./, '') + cookie.path;

      try {
        await chrome.cookies.remove({
          url: cookieUrl,
          name: cookie.name
        });
        blocked++;
      } catch (e) {}
    }

    if (url) {
      try {
        await chrome.cookies.remove({ url: url, name: cookieName });
        blocked++;
      } catch (e) {}
    }

    return { success: true, blocked: blocked };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSiteCookiesComprehensive(domain, options = {}) {
  const { incognito = false } = options;
  const allCookies = new Map();
  const storeId = incognito ? '1' : '0';
  const baseDomain = getBaseDomain(domain);

  const domainVariations = new Set([
    domain,
    '.' + domain,
    baseDomain,
    '.' + baseDomain,
  ]);

  const googleDomains = ['youtube.com', 'google.com', 'googleapis.com', 'gstatic.com', 'googlevideo.com'];
  if (googleDomains.some(d => baseDomain === d || domain.endsWith('.' + d))) {
    domainVariations.add('google.com');
    domainVariations.add('.google.com');
  }

  for (const domainVar of domainVariations) {
    try {
      const queryOptions = { domain: domainVar };
      if (incognito) {
        queryOptions.storeId = storeId;
      }
      const cookies = await chrome.cookies.getAll(queryOptions);
      cookies.forEach(cookie => {
        const key = `${cookie.name}::${cookie.domain}::${cookie.partitionKey?.topLevelSite || ''}`;
        if (!allCookies.has(key)) {
          allCookies.set(key, cookie);
        }
      });
    } catch (e) {}
  }

  try {
    const urlCookies = await chrome.cookies.getAll({ url: `https://${domain}` });
    urlCookies.forEach(cookie => {
      const key = `${cookie.name}::${cookie.domain}::${cookie.partitionKey?.topLevelSite || ''}`;
      if (!allCookies.has(key)) {
        allCookies.set(key, cookie);
      }
    });
  } catch (e) {}

  return Array.from(allCookies.values());
}

function getBaseDomain(domain) {
  if (!domain) return '';
  domain = domain.replace(/^\./, '');

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    return domain;
  }

  const multiPartTLDs = [
    'co.uk', 'co.jp', 'co.kr', 'co.nz', 'co.za', 'co.in',
    'com.au', 'com.br', 'com.cn', 'com.mx', 'com.sg',
    'org.uk', 'net.au', 'gov.uk', 'ac.uk'
  ];

  const parts = domain.split('.');

  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (multiPartTLDs.includes(lastTwo)) {
      return parts.slice(-3).join('.');
    }
  }

  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return domain;
}

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

  let domain;
  try {
    domain = new URL(message.url).hostname;
  } catch (e) {
    domain = 'unknown';
  }

  switch (message.event) {
    case 'banner_intercepted':
      extensionState.stats.totalBannersIntercepted++;
      extensionState.stats.sitesProtected.add(domain);
      updateBadge(sender.tab?.id, 'intercepted');
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

async function clearAllPreferences() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const keysToRemove = Object.keys(items).filter(key => key.startsWith('pref_'));

      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
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
      try {
        const domain = new URL(tab.url).hostname;
        chrome.storage.local.remove([`pref_${domain}`], () => {
          chrome.tabs.reload(tab.id).catch(() => {});
        });
      } catch (e) {}
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.isEnabled) {
      extensionState.isEnabled = changes.isEnabled.newValue;
    }
  }
});

(async () => {
  await loadExtensionState();
  await loadBlockedCookiesFromStorage();
})();
