class CookieDetector {
  constructor() {
    this.platforms = {
      oneTrust: {
        selectors: [
          '#onetrust-consent-sdk',
          '#onetrust-banner-sdk',
          '.onetrust-pc-dark-filter',
          '[class*="onetrust"]'
        ],
        acceptButtons: [
          '#onetrust-accept-btn-handler',
          '.onetrust-close-btn-handler',
          'button[id*="accept"]'
        ]
      },
      cookiebot: {
        selectors: [
          '#CybotCookiebotDialog',
          '.CybotCookiebotDialog',
          '#CookiebotWidget'
        ],
        acceptButtons: [
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
          '.CybotCookiebotDialogBodyButton[data-action="allow-all"]',
          'a[id*="AllowAll"]'
        ]
      },
      trustArc: {
        selectors: [
          '#truste-consent-track',
          '#consent-tracking',
          '.truste_box_overlay'
        ],
        acceptButtons: [
          '.truste-button1',
          '.pdynamicbutton',
          'a.call'
        ]
      },
      quantcast: {
        selectors: [
          '#qc-cmp2-container',
          '.qc-cmp2-container',
          '[class*="qc-cmp"]'
        ],
        acceptButtons: [
          'button[mode="primary"]',
          '.qc-cmp2-summary-buttons button:first-child'
        ]
      },
      osano: {
        selectors: [
          '.osano-cm-dialog',
          '.osano-cm-widget'
        ],
        acceptButtons: [
          '.osano-cm-accept-all',
          '.osano-cm-dialog__close'
        ]
      },
      cookieYes: {
        selectors: [
          '#cookie-law-info-bar',
          '.cli-modal',
          '[class*="cky-consent"]'
        ],
        acceptButtons: [
          '.cli_action_button',
          'a[data-cli_action="accept"]'
        ]
      }
    };

    this.genericPatterns = {
      selectors: [
        '[class*="cookie"][class*="banner"]',
        '[class*="cookie"][class*="consent"]',
        '[class*="cookie"][class*="notice"]',
        '[class*="cookie"][class*="bar"]',
        '[class*="consent"][class*="modal"]',
        '[class*="privacy"][class*="notice"]',
        '[class*="gdpr"][class*="banner"]',
        '[id*="cookie"][id*="banner"]',
        '[id*="cookie"][id*="consent"]',
        '[id*="privacy"][id*="notice"]',
        '[role="dialog"][aria-label*="cookie" i]',
        '[role="dialog"][aria-label*="privacy" i]',
        '[role="dialog"][aria-label*="consent" i]'
      ],
      acceptButtons: [
        'button[class*="accept"][class*="all" i]',
        'button[class*="allow"][class*="all" i]',
        'button[id*="accept"][id*="all" i]',
        'a[class*="accept"][class*="all" i]',
        'button:contains("Accept All")',
        'button:contains("Allow All")',
        'button:contains("I Accept")',
        'button:contains("I Agree")',
        '[data-action*="accept"]',
        '[data-consent="accept"]'
      ]
    };

    this.cookieDescriptions = {
      '_ga': 'Google Analytics: Distinguishes users and measures site usage.',
      '_gid': 'Google Analytics: Distinguishes users (24-hour expiration).',
      '_gat': 'Google Analytics: Throttles request rate.',
      'NID': 'Google: Remembers preferences and analyzes ad efficiency.',
      'SID': 'Google: Digitally signed account ID for authentication.',
      'HSID': 'Google: Encrypted account ID for security and fraud prevention.',
      'SSID': 'Google: Stores information about your use of the site and ads.',
      'APISID': 'Google: Used for targeting and personalized advertisements.',
      'SAPISID': 'Google: Used for targeting and personalized advertisements.',
      '__Secure-1PAPISID': 'Google: Builds a profile of your interests for relevant ads.',
      '__Secure-3PAPISID': 'Google: Builds a profile of your interests for relevant ads.',
      'SIDCC': 'Google: Security cookie to protect against unauthorized access.',
      '1P_JAR': 'Google: Tracks conversion rates and site statistics.',
      'CONSENT': 'Google: Stores cookie consent choices.',
      'SEARCH_SAMESITE': 'Google: Prevents the browser from sending this cookie with cross-site requests.',
      'PREF': 'Google/YouTube: Stores preferences like language and autoplay config.',
      'VISITOR_INFO1_LIVE': 'YouTube: Bandwidth estimation for video playback.',
      'YSC': 'YouTube: Tracks views of embedded videos.',
      'GPS': 'YouTube: Registers a unique ID on mobile devices for tracking.',
      '_fbp': 'Facebook: Tracks visits across websites to deliver ads.',
      'fr': 'Facebook: Encrypted ID for advertising.',
      'bcookie': 'LinkedIn: Browser ID cookie for tracking and auth.',
      'lidc': 'LinkedIn: Used for routing and load balancing.',
      'li_gc': 'LinkedIn: Stores consent of guests.',
      'muc_ads': 'Twitter: Collects data on user behaviour and interaction for ads.',
      'personalization_id': 'Twitter: Integrates Twitter features and social media sharing.',
      'cf_clearance': 'Cloudflare: Proof of challenge passage.',
      '__cf_bm': 'Cloudflare: Bot management and security.',
      'cf_ray': 'Cloudflare: Ray ID for traceability.',
      'AWSALB': 'Amazon: Load balancing for ensuring site performance.',
      'AWSALBCORS': 'Amazon: Load balancing with CORS support.',
      'shopify_y': 'Shopify: Analytics and marketing probe.',
      'shopify_s': 'Shopify: Analytics and marketing probe.',
      '_shopify_fs': 'Shopify: Analytics and marketing probe.',
      'keep_alive': 'Shopify: Keeps the connection alive.',
      'secure_customer_sig': 'Shopify: Identifies customer login.',
      'cart_sig': 'Shopify: Identifies the shopping cart.',
      'wp_woocommerce_session': 'WooCommerce: Unique code for each customer session.',
      'wordpress_test_cookie': 'WordPress: Checks if cookies are enabled.',
      'tk_ai': 'WooCommerce: Stores a randomly generated anonymous ID.',
      '__stripe_mid': 'Stripe: Fraud prevention.',
      '__stripe_sid': 'Stripe: Fraud prevention.',
      'PHPSESSID': 'PHP: Preserves session state across requests.',
      'JSESSIONID': 'Java: Preserves session state across requests.',
      'ASPSESSIONID': 'ASP.NET: Preserves session state.',
      'csrftoken': 'Security: Protects against Cross-Site Request Forgery.',
      'XSRF-TOKEN': 'Security: Protects against Cross-Site Request Forgery.',
      'uid': 'General: User ID for identification.',
      'lang': 'Preferences: Stores preferred language.',
      'g_state': 'Google: One Tap login status.',
      'cookieyes-consent': 'CookieYes: Consent preferences.',
      'OptanonConsent': 'OneTrust: Consent preferences.',
      'eupubconsent-v2': 'IAB: Transparency & Consent Framework string.'
    };
  }

  getCookieDescription(name) {
    if (this.cookieDescriptions[name]) {
      return this.cookieDescriptions[name];
    }

    if (name.startsWith('_ga_')) return 'Google Analytics: Session state for specific property.';
    if (name.includes('csrf')) return 'Security: Protects against Cross-Site Request Forgery.';
    if (name.includes('session')) return 'Session: Keeps you logged in or maintains your state.';

    return 'Purpose unknown or site-specific.';
  }

  detectBanner() {
    for (const [platformName, config] of Object.entries(this.platforms)) {
      const banner = this.findElement(config.selectors);
      if (banner && this.isVisible(banner)) {
        const acceptButton = this.findElement(config.acceptButtons, banner);
        return {
          platform: platformName,
          element: banner,
          acceptButton: acceptButton,
          isCustom: false
        };
      }
    }

    const genericBanner = this.findElement(this.genericPatterns.selectors);
    if (genericBanner && this.isVisible(genericBanner)) {
      const acceptButton = this.findAcceptButton(genericBanner);
      return {
        platform: 'custom',
        element: genericBanner,
        acceptButton: acceptButton,
        isCustom: true
      };
    }

    return null;
  }

  findElement(selectors, context = document) {
    for (const selector of selectors) {
      try {
        const element = context.querySelector(selector);
        if (element) return element;
      } catch (e) {
      }
    }
    return null;
  }

  findAcceptButton(banner) {
    const button = this.findElement(this.genericPatterns.acceptButtons, banner);
    if (button) return button;

    const buttons = banner.querySelectorAll('button, a[role="button"], a.btn, a.button');

    const acceptKeywords = [
      'accept all', 'allow all', 'accept cookies', 'allow cookies',
      'i accept', 'i agree', 'agree', 'ok', 'got it', 'continue',
      'понятно', 'принять', 'aceptar', 'accepter', 'akzeptieren'
    ];

    const rejectKeywords = [
      'reject', 'decline', 'refuse', 'deny', 'settings', 'customize',
      'manage', 'preferences', 'отклонить', 'rechazar', 'refuser'
    ];

    for (const button of buttons) {
      const text = button.textContent.toLowerCase().trim();
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      const combined = `${text} ${ariaLabel}`;

      const isAccept = acceptKeywords.some(keyword => combined.includes(keyword));
      const isReject = rejectKeywords.some(keyword => combined.includes(keyword));

      if (isAccept && !isReject) {
        return button;
      }
    }

    const prominentButton = this.findProminentButton(buttons);
    return prominentButton;
  }

  findProminentButton(buttons) {
    let maxScore = 0;
    let prominentButton = null;

    for (const button of buttons) {
      let score = 0;
      const classes = button.className.toLowerCase();
      const styles = window.getComputedStyle(button);

      if (classes.includes('primary')) score += 3;
      if (classes.includes('btn-primary')) score += 3;
      if (classes.includes('accept')) score += 2;
      if (classes.includes('allow')) score += 2;

      const bgColor = styles.backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        score += 1;
      }

      if (score > maxScore) {
        maxScore = score;
        prominentButton = button;
      }
    }

    return prominentButton;
  }

  isVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      styles.opacity !== '0'
    );
  }

  analyzeCookies(providedCookies = null) {
    let cookieObjects = [];
    const currentDomain = window.location.hostname;
    const currentBaseDomain = this.getBaseDomain(currentDomain);

    if (providedCookies) {
      if (Array.isArray(providedCookies)) {
        // Chrome API cookie objects - preserve full object
        cookieObjects = providedCookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          expirationDate: c.expirationDate,
          description: this.getCookieDescription(c.name)
        }));
      } else if (typeof providedCookies === 'string') {
        // String format from document.cookie
        const cookies = providedCookies.split(';').filter(c => c.trim());
        cookieObjects = cookies.map(c => {
          const name = c.split('=')[0].trim();
          return {
            name: name,
            value: c.split('=').slice(1).join('=').trim(),
            domain: currentDomain,
            description: this.getCookieDescription(name)
          };
        });
      }
    } else {
      // Fallback to document.cookie
      const cookies = document.cookie.split(';').filter(c => c.trim());
      cookieObjects = cookies.map(c => {
        const name = c.split('=')[0].trim();
        return {
          name: name,
          value: c.split('=').slice(1).join('=').trim(),
          domain: currentDomain,
          description: this.getCookieDescription(name)
        };
      });
    }

    const categories = {
      essential: [],
      analytics: [],
      advertising: [],
      thirdParty: [],
      unknown: []
    };

    const patterns = {
      analytics: ['_ga', '_gid', '_gat', 'analytics', '_hjid', '_clck', '_fbp', 'VISITOR_INFO', 'YSC'],
      advertising: ['_ads', 'fr', 'IDE', 'test_cookie', 'NID', 'DSID', '_gcl', 'personalization_id', 'muc_ads', 'GPS'],
      essential: ['session', 'csrf', 'auth', 'login', 'user', 'PHPSESSID', 'JSESSIONID', 'uid', 'id', 'consent', 'preference', 'g_state', 'PREF', 'SID', 'HSID', 'SSID', 'APISID', 'SAPISID', 'SIDCC', 'CONSENT', 'SEARCH_SAMESITE', '__Secure']
    };

    const thirdPartyDomains = new Set();

    for (const cookie of cookieObjects) {
      const name = cookie.name;
      const cookieDomain = (cookie.domain || '').replace(/^\./, ''); // Remove leading dot
      const cookieBaseDomain = this.getBaseDomain(cookieDomain);

      // Check if this is a third-party cookie (different base domain)
      const isThirdParty = cookieBaseDomain &&
                           currentBaseDomain &&
                           cookieBaseDomain !== currentBaseDomain &&
                           !this.areRelatedDomains(cookieBaseDomain, currentBaseDomain);

      if (isThirdParty) {
        categories.thirdParty.push(cookie);
        thirdPartyDomains.add(cookieDomain);
        continue; // Third-party cookies don't need further categorization
      }

      let categorized = false;
      for (const [category, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => name.toLowerCase().includes(keyword.toLowerCase()))) {
          categories[category].push(cookie);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        categories.unknown.push(cookie);
      }
    }

    // Also detect third-party domains from iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const src = iframe.src;
        if (src) {
          const url = new URL(src);
          if (url.hostname !== currentDomain) {
            thirdPartyDomains.add(url.hostname);
          }
        }
      } catch (e) {
      }
    });

    return {
      total: cookieObjects.length,
      categories: categories,
      thirdPartyDomains: Array.from(thirdPartyDomains),
      breakdown: {
        essential: categories.essential.length,
        analytics: categories.analytics.length,
        advertising: categories.advertising.length,
        thirdParty: categories.thirdParty.length,
        unknown: categories.unknown.length
      }
    };
  }

  getBaseDomain(domain) {
    if (!domain) return '';
    const parts = domain.split('.');
    if (parts.length <= 2) return domain;
    return parts.slice(-2).join('.');
  }

  areRelatedDomains(domain1, domain2) {
    // Check if domains are related (e.g., youtube.com and google.com are related)
    const relatedGroups = [
      ['google.com', 'youtube.com', 'googleapis.com', 'gstatic.com', 'googlevideo.com', 'ytimg.com', 'googleusercontent.com'],
      ['facebook.com', 'fbcdn.net', 'instagram.com'],
      ['twitter.com', 'twimg.com', 'x.com']
    ];

    for (const group of relatedGroups) {
      if (group.includes(domain1) && group.includes(domain2)) {
        return true;
      }
    }
    return false;
  }

  detectTrackers() {
    const trackers = [];
    const scripts = document.querySelectorAll('script[src]');

    const knownTrackers = {
      'google-analytics.com': 'Google Analytics',
      'googletagmanager.com': 'Google Tag Manager',
      'doubleclick.net': 'Google DoubleClick',
      'facebook.net': 'Facebook Pixel',
      'facebook.com/tr': 'Facebook Pixel',
      'hotjar.com': 'Hotjar',
      'clarity.ms': 'Microsoft Clarity',
      'segment.com': 'Segment',
      'mixpanel.com': 'Mixpanel',
      'amplitude.com': 'Amplitude',
      'mouseflow.com': 'Mouseflow',
      'quantserve.com': 'Quantcast',
      'scorecardresearch.com': 'comScore',
      'optimizely.com': 'Optimizely',
      'crazyegg.com': 'Crazy Egg',
      'bing.com': 'Bing Ads',
      'twitter.com': 'Twitter Pixel',
      'linkedin.com': 'LinkedIn Insight'
    };

    scripts.forEach(script => {
      const src = script.src;
      for (const [domain, name] of Object.entries(knownTrackers)) {
        if (src.includes(domain)) {
          trackers.push({
            name: name,
            domain: domain,
            type: this.getTrackerType(name)
          });
        }
      }
    });

    return trackers;
  }

  getTrackerType(name) {
    const analytics = ['Analytics', 'Tag Manager', 'Hotjar', 'Clarity', 'Segment', 'Mixpanel', 'Amplitude', 'Mouseflow'];
    const advertising = ['DoubleClick', 'Pixel', 'Ads', 'Quantcast', 'comScore'];

    if (analytics.some(type => name.includes(type))) return 'analytics';
    if (advertising.some(type => name.includes(type))) return 'advertising';
    return 'other';
  }

  calculatePrivacyScore(cookieData, trackers) {
    let score = 100;
    const breakdown = [];

    const analyticsDeduction = Math.min(cookieData.breakdown.analytics * 3, 15);
    if (analyticsDeduction > 0) {
      score -= analyticsDeduction;
      breakdown.push({
        factor: 'Analytics Cookies',
        impact: -analyticsDeduction,
        detail: `${cookieData.breakdown.analytics} cookie(s) × 3 pts (max -15)`,
        type: 'negative'
      });
    }

    const advertisingDeduction = Math.min(cookieData.breakdown.advertising * 5, 25);
    if (advertisingDeduction > 0) {
      score -= advertisingDeduction;
      breakdown.push({
        factor: 'Advertising Cookies',
        impact: -advertisingDeduction,
        detail: `${cookieData.breakdown.advertising} cookie(s) × 5 pts (max -25)`,
        type: 'negative'
      });
    }

    const thirdPartyDeduction = Math.min(cookieData.breakdown.thirdParty * 4, 20);
    if (thirdPartyDeduction > 0) {
      score -= thirdPartyDeduction;
      breakdown.push({
        factor: 'Third-Party Domains',
        impact: -thirdPartyDeduction,
        detail: `${cookieData.breakdown.thirdParty} domain(s) × 4 pts (max -20)`,
        type: 'negative'
      });
    }

    const trackerDeduction = Math.min(trackers.length * 3, 30);
    if (trackerDeduction > 0) {
      score -= trackerDeduction;
      breakdown.push({
        factor: 'Trackers Detected',
        impact: -trackerDeduction,
        detail: `${trackers.length} tracker(s) × 3 pts (max -30)`,
        type: 'negative'
      });
    }

    const isHttps = window.location.protocol === 'https:';
    if (isHttps) {
      score += 5;
      breakdown.push({
        factor: 'HTTPS Connection',
        impact: +5,
        detail: 'Secure connection bonus',
        type: 'positive'
      });
    } else {
      breakdown.push({
        factor: 'No HTTPS',
        impact: 0,
        detail: 'Insecure connection (no bonus)',
        type: 'neutral'
      });
    }

    if (cookieData.breakdown.analytics === 0 && cookieData.breakdown.advertising === 0) {
      breakdown.unshift({
        factor: 'No Tracking Cookies',
        impact: 0,
        detail: 'No analytics or advertising cookies found',
        type: 'positive'
      });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      breakdown: breakdown,
      maxPossible: 105,
      baseScore: 100
    };
  }
}

if (typeof window !== 'undefined') {
  window.CookieDetector = CookieDetector;
}
