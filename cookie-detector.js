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

    this.multiPartTLDs = [
      'co.uk', 'co.jp', 'co.kr', 'co.nz', 'co.za', 'co.in',
      'com.au', 'com.br', 'com.cn', 'com.mx', 'com.sg',
      'org.uk', 'net.au', 'gov.uk', 'ac.uk', 'edu.au'
    ];

    this.relatedDomainGroups = [
      ['google.com', 'youtube.com', 'googleapis.com', 'gstatic.com', 'googlevideo.com', 'ytimg.com', 'googleusercontent.com', 'ggpht.com', 'googleadservices.com'],
      ['facebook.com', 'fbcdn.net', 'instagram.com', 'fb.com', 'fbsbx.com'],
      ['twitter.com', 'twimg.com', 'x.com', 't.co'],
      ['microsoft.com', 'msn.com', 'bing.com', 'live.com', 'outlook.com', 'azure.com'],
      ['amazon.com', 'amazonaws.com', 'cloudfront.net', 'amazonws.com'],
      ['apple.com', 'icloud.com', 'cdn-apple.com']
    ];

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
      'SEARCH_SAMESITE': 'Google: Prevents cross-site request sending.',
      'PREF': 'Google/YouTube: Stores preferences like language and autoplay config.',
      'VISITOR_INFO1_LIVE': 'YouTube: Bandwidth estimation for video playback.',
      'YSC': 'YouTube: Tracks views of embedded videos.',
      'GPS': 'YouTube: Registers a unique ID on mobile devices for tracking.',
      '_fbp': 'Facebook: Tracks visits across websites to deliver ads.',
      'fr': 'Facebook: Encrypted ID for advertising.',
      'bcookie': 'LinkedIn: Browser ID cookie for tracking and auth.',
      'lidc': 'LinkedIn: Used for routing and load balancing.',
      'li_gc': 'LinkedIn: Stores consent of guests.',
      'muc_ads': 'Twitter: Collects data on user behaviour for ads.',
      'personalization_id': 'Twitter: Integrates Twitter features and social sharing.',
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

    this.definiteCookies = {
      'PHPSESSID': { category: 'essential', confidence: 'high' },
      'JSESSIONID': { category: 'essential', confidence: 'high' },
      'csrftoken': { category: 'essential', confidence: 'high' },
      'XSRF-TOKEN': { category: 'essential', confidence: 'high' },
      '_ga': { category: 'analytics', confidence: 'high' },
      '_gid': { category: 'analytics', confidence: 'high' },
      '_gat': { category: 'analytics', confidence: 'high' },
      'IDE': { category: 'advertising', confidence: 'high' },
      'fr': { category: 'advertising', confidence: 'high' },
      '_fbp': { category: 'advertising', confidence: 'high' },
      'NID': { category: 'advertising', confidence: 'high' }
    };

    this.classificationPatterns = {
      analytics: [
        { regex: /^_ga_/, confidence: 'medium' },
        { regex: /^_gat_/, confidence: 'medium' },
        { regex: /^_hj/, confidence: 'medium' },
        { regex: /^_pk_/, confidence: 'medium' },
        { regex: /analytics/i, confidence: 'low' },
        { regex: /VISITOR_INFO/i, confidence: 'medium' },
        { regex: /^YSC$/, confidence: 'medium' }
      ],
      advertising: [
        { regex: /_gcl_/, confidence: 'medium' },
        { regex: /^ads_/, confidence: 'medium' },
        { regex: /personalization_id/, confidence: 'medium' },
        { regex: /muc_ads/, confidence: 'medium' },
        { regex: /^GPS$/, confidence: 'medium' }
      ],
      essential: [
        { regex: /csrf/i, confidence: 'medium' },
        { regex: /xsrf/i, confidence: 'medium' },
        { regex: /session/i, confidence: 'low' },
        { regex: /^auth/i, confidence: 'medium' },
        { regex: /^login/i, confidence: 'medium' },
        { regex: /consent/i, confidence: 'medium' },
        { regex: /^PREF$/, confidence: 'medium' },
        { regex: /^SID$/, confidence: 'medium' },
        { regex: /^HSID$/, confidence: 'medium' },
        { regex: /^SSID$/, confidence: 'medium' },
        { regex: /^SIDCC$/, confidence: 'medium' },
        { regex: /^__Secure-/, confidence: 'medium' }
      ]
    };
  }

  getCookieDescription(name) {
    if (this.cookieDescriptions[name]) {
      return this.cookieDescriptions[name];
    }

    if (name.startsWith('_ga_')) return 'Google Analytics: Session state for specific property.';
    if (name.includes('csrf') || name.includes('xsrf')) return 'Security: Protects against Cross-Site Request Forgery.';
    if (name.toLowerCase().includes('session')) return 'Session: Keeps you logged in or maintains your state.';

    return 'Purpose unknown or site-specific.';
  }

  detectBanner() {
    if (typeof document === 'undefined') return null;

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
      } catch (e) {}
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

    return this.findProminentButton(buttons);
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

  analyzeCookies(providedCookies = null, siteContext = null) {
    let currentDomain, currentBaseDomain;

    if (siteContext && siteContext.hostname) {
      currentDomain = siteContext.hostname;
      currentBaseDomain = this.getBaseDomain(currentDomain);
    } else if (typeof window !== 'undefined' && window.location) {
      currentDomain = window.location.hostname;
      currentBaseDomain = this.getBaseDomain(currentDomain);
    } else {
      return this.createEmptyResult(providedCookies);
    }

    let cookieObjects = this.parseCookies(providedCookies, currentDomain);

    const categories = {
      essential: [],
      analytics: [],
      advertising: [],
      thirdParty: [],
      unknown: []
    };

    const thirdPartyDomains = new Set();

    for (const cookie of cookieObjects) {
      const classification = this.classifyCookie(cookie, currentDomain, currentBaseDomain);
      cookie.classification = classification;

      if (classification.category === 'thirdParty') {
        categories.thirdParty.push(cookie);
        const cookieDomain = (cookie.domain || '').replace(/^\./, '');
        if (cookieDomain) thirdPartyDomains.add(cookieDomain);
      } else {
        categories[classification.category].push(cookie);
      }
    }

    if (typeof document !== 'undefined') {
      try {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            const src = iframe.src;
            if (src) {
              const url = new URL(src);
              if (url.hostname !== currentDomain && !this.areRelatedDomains(this.getBaseDomain(url.hostname), currentBaseDomain)) {
                thirdPartyDomains.add(url.hostname);
              }
            }
          } catch (e) {}
        });
      } catch (e) {}
    }

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

  parseCookies(providedCookies, defaultDomain) {
    if (!providedCookies) {
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';').filter(c => c.trim());
        return cookies.map(c => {
          const name = c.split('=')[0].trim();
          return {
            name: name,
            value: c.split('=').slice(1).join('=').trim(),
            domain: defaultDomain,
            description: this.getCookieDescription(name)
          };
        });
      }
      return [];
    }

    if (Array.isArray(providedCookies)) {
      return providedCookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
        expirationDate: c.expirationDate,
        session: !c.expirationDate,
        partitionKey: c.partitionKey,
        isPartitioned: !!c.partitionKey,
        description: this.getCookieDescription(c.name)
      }));
    }

    if (typeof providedCookies === 'string') {
      const cookies = providedCookies.split(';').filter(c => c.trim());
      return cookies.map(c => {
        const name = c.split('=')[0].trim();
        return {
          name: name,
          value: c.split('=').slice(1).join('=').trim(),
          domain: defaultDomain,
          description: this.getCookieDescription(name)
        };
      });
    }

    return [];
  }

  classifyCookie(cookie, currentDomain, currentBaseDomain) {
    const name = cookie.name || '';
    const cookieDomain = (cookie.domain || '').replace(/^\./, '');
    const cookieBaseDomain = this.getBaseDomain(cookieDomain);

    if (cookieDomain && cookieBaseDomain && currentBaseDomain) {
      const isThirdParty = cookieBaseDomain !== currentBaseDomain &&
                           !this.areRelatedDomains(cookieBaseDomain, currentBaseDomain);
      if (isThirdParty) {
        return {
          category: 'thirdParty',
          confidence: 'high',
          signals: [`Domain ${cookieDomain} differs from site ${currentDomain}`],
          note: 'Cookie from external domain'
        };
      }
    }

    if (this.definiteCookies[name]) {
      const def = this.definiteCookies[name];
      return {
        category: def.category,
        confidence: def.confidence,
        signals: [`Known cookie: ${name}`]
      };
    }

    for (const [category, patterns] of Object.entries(this.classificationPatterns)) {
      for (const pattern of patterns) {
        if (pattern.regex.test(name)) {
          return {
            category: category,
            confidence: pattern.confidence,
            signals: [`Name matches pattern: ${pattern.regex.toString()}`]
          };
        }
      }
    }

    const domainCategories = {
      'doubleclick.net': 'advertising',
      'googlesyndication.com': 'advertising',
      'googleadservices.com': 'advertising',
      'google-analytics.com': 'analytics',
      'hotjar.com': 'analytics',
      'clarity.ms': 'analytics'
    };

    if (domainCategories[cookieBaseDomain]) {
      return {
        category: domainCategories[cookieBaseDomain],
        confidence: 'medium',
        signals: [`Domain ${cookieBaseDomain} is known ${domainCategories[cookieBaseDomain]} provider`]
      };
    }

    const signals = ['No matching patterns found'];

    if (cookie.session) {
      signals.push('Session cookie (no expiration)');
    } else if (cookie.expirationDate) {
      const daysToExpiry = (cookie.expirationDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysToExpiry > 365) {
        signals.push(`Long-lived: expires in ${Math.round(daysToExpiry)} days`);
      }
    }

    if (cookie.sameSite === 'none') {
      signals.push('Cross-site enabled (SameSite=None)');
    }

    return {
      category: 'unknown',
      confidence: 'none',
      signals: signals,
      note: 'Purpose could not be determined. May be site-specific.'
    };
  }

  createEmptyResult(cookies) {
    const cookieObjects = Array.isArray(cookies)
      ? cookies.map(c => ({ ...c, description: this.getCookieDescription(c.name) }))
      : [];
    return {
      total: cookieObjects.length,
      categories: { essential: [], analytics: [], advertising: [], thirdParty: [], unknown: cookieObjects },
      thirdPartyDomains: [],
      breakdown: { essential: 0, analytics: 0, advertising: 0, thirdParty: 0, unknown: cookieObjects.length }
    };
  }

  getBaseDomain(domain) {
    if (!domain) return '';

    domain = domain.replace(/^\./, '');

    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
      return domain;
    }

    const parts = domain.split('.');

    if (parts.length >= 3) {
      const lastTwo = parts.slice(-2).join('.');
      if (this.multiPartTLDs.includes(lastTwo)) {
        return parts.slice(-3).join('.');
      }
    }

    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return domain;
  }

  areRelatedDomains(domain1, domain2) {
    if (!domain1 || !domain2) return false;
    if (domain1 === domain2) return true;

    for (const group of this.relatedDomainGroups) {
      if (group.includes(domain1) && group.includes(domain2)) {
        return true;
      }
    }
    return false;
  }

  detectTrackers() {
    if (typeof document === 'undefined') return [];

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

    const isHttps = typeof window !== 'undefined' && window.location
      ? window.location.protocol === 'https:'
      : true;

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
        factor: 'Third-Party Cookies',
        impact: -thirdPartyDeduction,
        detail: `${cookieData.breakdown.thirdParty} cookie(s) × 4 pts (max -20)`,
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
