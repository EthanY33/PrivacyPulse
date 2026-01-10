class WarningModal {
  constructor() {
    this.modal = null;
    this.isVisible = false;
    this.onAcceptCallback = null;
    this.onRejectCallback = null;
    this.onCustomizeCallback = null;
  }

  collectAllCookies(data) {
    const allCookies = [];
    const categories = data.cookieData.categories || {};

    Object.values(categories).forEach(cookieList => {
      if (Array.isArray(cookieList)) {
        cookieList.forEach(c => {
          if (c && c.name) {
            allCookies.push(c);
          }
        });
      }
    });

    if (data.rawCookies && Array.isArray(data.rawCookies)) {
      return data.rawCookies;
    }

    return allCookies;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  truncateValue(value, maxLength) {
    if (!value) return '';
    const str = String(value);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  formatExpiry(timestamp) {
    if (!timestamp) return 'Session';
    try {
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return 'Session';
      const now = new Date();
      const diff = date - now;
      if (diff < 0) return 'Expired';
      if (diff < 3600000) return Math.round(diff / 60000) + 'm';
      if (diff < 86400000) return Math.round(diff / 3600000) + 'h';
      if (diff < 2592000000) return Math.round(diff / 86400000) + 'd';
      return Math.round(diff / 2592000000) + 'mo';
    } catch (e) {
      return 'Session';
    }
  }

  getCookieFlags(cookie) {
    const flags = [];
    if (cookie.secure) flags.push('Secure');
    if (cookie.httpOnly) flags.push('HttpOnly');
    if (cookie.sameSite) flags.push(cookie.sameSite);
    return flags.length > 0 ? flags.join(', ') : '-';
  }

  renderRawCookies(cookies) {
    if (!cookies || cookies.length === 0) {
      return '<tr><td colspan="5" class="ppg-empty-row">No cookies found</td></tr>';
    }

    return cookies.map(cookie => {
      const name = cookie.name || 'Unknown';
      const value = this.truncateValue(cookie.value || '', 50);
      const domain = cookie.domain || window.location.hostname;
      const expires = this.formatExpiry(cookie.expirationDate || cookie.expires);
      const flags = this.getCookieFlags(cookie);

      return `
        <tr>
          <td class="ppg-raw-name">${this.escapeHtml(name)}</td>
          <td class="ppg-raw-value" title="${this.escapeHtml(cookie.value || '')}">${this.escapeHtml(value)}</td>
          <td class="ppg-raw-domain">${this.escapeHtml(domain)}</td>
          <td class="ppg-raw-expires">${expires}</td>
          <td class="ppg-raw-flags">${flags}</td>
        </tr>
      `;
    }).join('');
  }

  renderLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      if (keys.length === 0) {
        return '<tr><td colspan="2" class="ppg-empty-row">No localStorage data</td></tr>';
      }

      return keys.slice(0, 20).map(key => {
        const value = this.truncateValue(localStorage.getItem(key) || '', 100);
        return `
          <tr>
            <td class="ppg-raw-name">${this.escapeHtml(key)}</td>
            <td class="ppg-raw-value" title="${this.escapeHtml(localStorage.getItem(key) || '')}">${this.escapeHtml(value)}</td>
          </tr>
        `;
      }).join('') + (keys.length > 20 ? `<tr><td colspan="2" class="ppg-more-row">+${keys.length - 20} more items</td></tr>` : '');
    } catch (e) {
      return '<tr><td colspan="2" class="ppg-empty-row">Cannot access localStorage</td></tr>';
    }
  }

  renderSessionStorage() {
    try {
      const keys = Object.keys(sessionStorage);
      if (keys.length === 0) {
        return '<tr><td colspan="2" class="ppg-empty-row">No sessionStorage data</td></tr>';
      }

      return keys.slice(0, 20).map(key => {
        const value = this.truncateValue(sessionStorage.getItem(key) || '', 100);
        return `
          <tr>
            <td class="ppg-raw-name">${this.escapeHtml(key)}</td>
            <td class="ppg-raw-value" title="${this.escapeHtml(sessionStorage.getItem(key) || '')}">${this.escapeHtml(value)}</td>
          </tr>
        `;
      }).join('') + (keys.length > 20 ? `<tr><td colspan="2" class="ppg-more-row">+${keys.length - 20} more items</td></tr>` : '');
    } catch (e) {
      return '<tr><td colspan="2" class="ppg-empty-row">Cannot access sessionStorage</td></tr>';
    }
  }

  getScoreClass(score) {
    if (score >= 75) return 'ppg-score-good';
    if (score >= 50) return 'ppg-score-medium';
    return 'ppg-score-poor';
  }

  getScoreLabel(score) {
    if (score >= 75) return 'Good Privacy';
    if (score >= 50) return 'Moderate Privacy';
    return 'Poor Privacy';
  }

  show(data, onAccept, onReject, onCustomize, viewOnly = false) {
    if (this.isVisible) return;

    this.onAcceptCallback = onAccept;
    this.onRejectCallback = onReject;
    this.onCustomizeCallback = onCustomize;
    this.viewOnly = viewOnly;

    this.createModal(data);
    this.attachEventListeners();
    document.body.appendChild(this.modal);
    this.isVisible = true;

    setTimeout(() => {
      this.modal.classList.add('ppg-modal-visible');
    }, 10);

    this.sendAnalytics(viewOnly ? 'view_site_data' : 'modal_shown', data);
  }

  createModal(data) {
    const modal = document.createElement('div');
    modal.id = 'privacy-pulse-guardian-modal';
    modal.className = 'ppg-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'ppg-modal-title');
    modal.setAttribute('aria-modal', 'true');

    const scoreData = data.privacyScore || { score: 0, breakdown: [] };
    const score = typeof scoreData === 'object' ? scoreData.score : scoreData;
    const breakdown = typeof scoreData === 'object' ? scoreData.breakdown : [];
    const scoreClass = this.getScoreClass(score);
    const scoreLabel = this.getScoreLabel(score);
    const title = this.viewOnly ? 'Site Privacy Overview' : 'Privacy Notice';
    const warningMsg = this.viewOnly
      ? `<p>Current cookies and trackers on <strong>${data.domain}</strong></p>`
      : `<p><strong>Before you accept:</strong> This website wants to track your activity. Here's what you're agreeing to:</p>`;

    const allCookies = this.collectAllCookies(data);

    modal.innerHTML = `
      <div class="ppg-modal-overlay"></div>
      <div class="ppg-modal-content">
        <div class="ppg-modal-header">
          <div class="ppg-header-top">
            <h2 id="ppg-modal-title">
              <svg class="ppg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.viewOnly ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}" />
              </svg>
              ${title}
            </h2>
            <button class="ppg-close-btn" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="ppg-privacy-score ${scoreClass}">
            <div class="ppg-score-main">
              <div class="ppg-score-number">${score}</div>
              <div class="ppg-score-label">
                <strong>Privacy Score</strong>
                <span>${scoreLabel}</span>
              </div>
            </div>
            <div class="ppg-score-bar">
              <div class="ppg-score-fill" style="width: ${score}%"></div>
            </div>
            <button class="ppg-score-toggle" aria-expanded="false">
              <span>How is this calculated?</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="ppg-score-breakdown" style="display: none;">
              <div class="ppg-breakdown-header">
                <span>Starting Score: 100</span>
              </div>
              ${this.renderScoreBreakdown(breakdown)}
              <div class="ppg-breakdown-footer">
                <span>Final Score: <strong>${score}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="ppg-tabs">
          <button class="ppg-tab ppg-tab-active" data-tab="analysis">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Privacy Analysis
          </button>
          <button class="ppg-tab" data-tab="rawdata">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16" />
            </svg>
            Raw Site Data
          </button>
        </div>

        <div class="ppg-modal-body ppg-tab-content" data-tab-content="analysis">
          <div class="ppg-warning-message">
            ${warningMsg}
          </div>

          <div class="ppg-section">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cookies (${data.cookieData.total})
            </h3>
            <div class="ppg-cookie-breakdown">
              ${this.renderCookieCategory('Essential', data.cookieData.breakdown.essential, 'Necessary for site functionality', 'green', data.cookieData.categories.essential)}
              ${this.renderCookieCategory('Analytics', data.cookieData.breakdown.analytics, 'Track your behavior and usage', 'yellow', data.cookieData.categories.analytics)}
              ${this.renderCookieCategory('Advertising', data.cookieData.breakdown.advertising, 'Used for targeted ads', 'red', data.cookieData.categories.advertising)}
              ${this.renderCookieCategory('Third-party', data.cookieData.breakdown.thirdParty, 'Shared with external companies', 'red', data.cookieData.categories.thirdParty)}
              ${this.renderCookieCategory('Uncategorized', data.cookieData.breakdown.unknown, 'Purpose unknown', 'gray', data.cookieData.categories.unknown)}
            </div>
          </div>

          ${data.trackers.length > 0 ? `
          <div class="ppg-section">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Trackers Detected (${data.trackers.length})
            </h3>
            <div class="ppg-trackers-list">
              ${this.renderTrackers(data.trackers)}
            </div>
          </div>
          ` : ''}

          <div class="ppg-section ppg-data-collection">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What Data Gets Collected?
            </h3>
            <ul class="ppg-data-list">
              <li>Your browsing history on this site</li>
              <li>Pages visited and time spent</li>
              <li>Clicks, scrolls, and interactions</li>
              <li>Device and browser information</li>
              <li>IP address and approximate location</li>
              ${data.trackers.some(t => t.type === 'advertising') ? '<li><strong>Cross-site tracking for advertising</strong></li>' : ''}
            </ul>
          </div>

          ${data.cookieData.thirdPartyDomains.length > 0 ? `
          <div class="ppg-section ppg-companies">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Companies Receiving Your Data
            </h3>
            <div class="ppg-companies-list">
              ${this.renderCompanies(data.cookieData.thirdPartyDomains, data.trackers)}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="ppg-modal-body ppg-tab-content ppg-tab-hidden" data-tab-content="rawdata">
          <div class="ppg-raw-data-section">
            <div class="ppg-raw-header">
              <h3>
                <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                </svg>
                All Cookies (${allCookies.length})
              </h3>
              <p class="ppg-raw-desc">Complete list of cookies stored by this site, similar to what you see in browser DevTools or Google's "On Site Data".</p>
            </div>
            <div class="ppg-raw-table-container">
              <table class="ppg-raw-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Domain</th>
                    <th>Expires</th>
                    <th>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderRawCookies(allCookies)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="ppg-raw-data-section">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4l4 4" />
              </svg>
              Local Storage
            </h3>
            <p class="ppg-raw-desc">Data stored in browser's localStorage for this site.</p>
            <div class="ppg-raw-table-container">
              <table class="ppg-raw-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value (truncated)</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderLocalStorage()}
                </tbody>
              </table>
            </div>
          </div>

          <div class="ppg-raw-data-section">
            <h3>
              <svg class="ppg-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 12h8m-8 5h4" />
              </svg>
              Session Storage
            </h3>
            <p class="ppg-raw-desc">Temporary data stored for this browser session.</p>
            <div class="ppg-raw-table-container">
              <table class="ppg-raw-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value (truncated)</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderSessionStorage()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="ppg-modal-footer">
          ${this.viewOnly ? `
            <button class="ppg-btn ppg-btn-close" data-action="close">
              Close
            </button>
          ` : `
            <button class="ppg-btn ppg-btn-reject" data-action="reject">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject All
            </button>
            <button class="ppg-btn ppg-btn-customize" data-action="customize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Customize
            </button>
            <button class="ppg-btn ppg-btn-accept" data-action="accept">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Accept Anyway
            </button>
          `}
        </div>

        <div class="ppg-modal-footer-note">
          Protected by <strong>Privacy Pulse Guardian</strong>
        </div>
      </div>
    `;

    this.modal = modal;
  }

  renderCookieCategory(name, count, description, color, cookies = []) {
    if (count === 0) return '';

    const categoryId = `ppg-category-${name.toLowerCase().replace(/[^a-z]/g, '')}`;

    const cookieDetailsHtml = cookies && cookies.length > 0
      ? `<div class="ppg-cookie-details" id="${categoryId}-details" style="display: none;">
           <table class="ppg-cookie-details-table">
             <thead>
               <tr>
                 <th>Cookie Name</th>
                 <th>Domain</th>
                 <th>Purpose</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               ${cookies.map(c => `
                 <tr class="ppg-cookie-detail-row" data-cookie-name="${this.escapeHtml(c.name)}">
                   <td class="ppg-detail-name">
                     <code>${this.escapeHtml(c.name)}</code>
                   </td>
                   <td class="ppg-detail-domain">
                     <span class="ppg-domain-badge">${this.escapeHtml(c.domain || window.location.hostname)}</span>
                   </td>
                   <td class="ppg-detail-purpose">
                     ${this.escapeHtml(c.description || 'Unknown purpose')}
                   </td>
                   <td class="ppg-detail-action">
                     <button class="ppg-block-cookie-btn" data-cookie="${this.escapeHtml(c.name)}" data-domain="${this.escapeHtml(c.domain || window.location.hostname)}" title="Block this cookie">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                       </svg>
                       Block
                     </button>
                   </td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </div>`
      : '<div class="ppg-cookie-details ppg-no-details" style="display: none;">No detailed cookie information available</div>';

    return `
      <div class="ppg-cookie-item ppg-${color}" data-category="${categoryId}">
        <div class="ppg-cookie-header ppg-expandable" data-target="${categoryId}-details" role="button" tabindex="0" aria-expanded="false">
          <div class="ppg-cookie-header-left">
            <span class="ppg-cookie-badge">${count}</span>
            <strong>${name}</strong>
          </div>
          <div class="ppg-cookie-header-right">
            <span class="ppg-expand-hint">Click to view details</span>
            <svg class="ppg-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p class="ppg-cookie-desc">${description}</p>
        ${cookieDetailsHtml}
      </div>
    `;
  }

  renderTrackers(trackers) {
    const grouped = trackers.slice(0, 8);
    const remaining = trackers.length - 8;

    return `
      <div class="ppg-tracker-grid">
        ${grouped.map(tracker => `
          <div class="ppg-tracker-item" title="${tracker.domain}">
            <span class="ppg-tracker-icon ppg-tracker-${tracker.type}"></span>
            <span class="ppg-tracker-name">${tracker.name}</span>
          </div>
        `).join('')}
        ${remaining > 0 ? `<div class="ppg-tracker-item ppg-tracker-more">+${remaining} more</div>` : ''}
      </div>
    `;
  }

  renderCompanies(domains, trackers) {
    const allCompanies = [...new Set([
      ...domains.slice(0, 5),
      ...trackers.slice(0, 3).map(t => t.name)
    ])];

    if (allCompanies.length === 0) {
      return `
        <div class="ppg-no-companies">
          <p>No external companies detected receiving your data from this page.</p>
        </div>
      `;
    }

    return `
      <div class="ppg-companies-grid">
        ${allCompanies.map(company => `
          <div class="ppg-company-chip">${this.formatCompanyName(company)}</div>
        `).join('')}
        ${domains.length > 5 ? `<div class="ppg-company-chip ppg-company-more">+${domains.length - 5} more</div>` : ''}
      </div>
    `;
  }

  formatCompanyName(name) {
    if (name.includes('.')) {
      const parts = name.split('.');
      return parts[parts.length - 2] || name;
    }
    return name;
  }

  renderScoreBreakdown(breakdown) {
    if (!breakdown || breakdown.length === 0) {
      return '<div class="ppg-breakdown-item ppg-positive"><span>No factors detected</span></div>';
    }

    return breakdown.map(item => {
      const impactClass = item.type === 'positive' ? 'ppg-positive' :
                          item.type === 'negative' ? 'ppg-negative' : 'ppg-neutral';
      const impactSign = item.impact > 0 ? '+' : '';
      const impactDisplay = item.impact !== 0 ? `${impactSign}${item.impact}` : '—';

      return `
        <div class="ppg-breakdown-item ${impactClass}">
          <div class="ppg-breakdown-factor">
            <span class="ppg-breakdown-name">${item.factor}</span>
            <span class="ppg-breakdown-detail">${item.detail}</span>
          </div>
          <div class="ppg-breakdown-impact">${impactDisplay}</div>
        </div>
      `;
    }).join('');
  }

  attachEventListeners() {
    const closeBtn = this.modal.querySelector('.ppg-close-btn');
    const rejectBtn = this.modal.querySelector('[data-action="reject"]');
    const customizeBtn = this.modal.querySelector('[data-action="customize"]');
    const acceptBtn = this.modal.querySelector('[data-action="accept"]');
    const overlay = this.modal.querySelector('.ppg-modal-overlay');

    closeBtn.addEventListener('click', () => this.hide());
    overlay.addEventListener('click', () => this.hide());

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        this.sendAnalytics('reject_clicked');
        this.hide();
        if (this.onRejectCallback) this.onRejectCallback();
      });
    }

    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        this.sendAnalytics('customize_clicked');
        this.hide();
        if (this.onCustomizeCallback) this.onCustomizeCallback();
      });
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        this.sendAnalytics('accept_anyway_clicked');
        this.hide();
        if (this.onAcceptCallback) this.onAcceptCallback();
      });
    }

    const closeActionBtn = this.modal.querySelector('[data-action="close"]');
    if (closeActionBtn) {
      closeActionBtn.addEventListener('click', () => this.hide());
    }

    const scoreToggle = this.modal.querySelector('.ppg-score-toggle');
    const scoreBreakdown = this.modal.querySelector('.ppg-score-breakdown');
    if (scoreToggle && scoreBreakdown) {
      scoreToggle.addEventListener('click', () => {
        const isExpanded = scoreToggle.getAttribute('aria-expanded') === 'true';
        scoreToggle.setAttribute('aria-expanded', !isExpanded);
        scoreBreakdown.style.display = isExpanded ? 'none' : 'block';
        scoreToggle.classList.toggle('ppg-expanded', !isExpanded);
      });
    }

    const tabs = this.modal.querySelectorAll('.ppg-tab');
    const tabContents = this.modal.querySelectorAll('.ppg-tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('ppg-tab-active'));
        tab.classList.add('ppg-tab-active');
        tabContents.forEach(content => {
          if (content.getAttribute('data-tab-content') === targetTab) {
            content.classList.remove('ppg-tab-hidden');
          } else {
            content.classList.add('ppg-tab-hidden');
          }
        });
        this.sendAnalytics('tab_switched', { tab: targetTab });
      });
    });

    // Cookie category expand/collapse
    const expandableHeaders = this.modal.querySelectorAll('.ppg-expandable');
    expandableHeaders.forEach(header => {
      const handleExpand = () => {
        const targetId = header.getAttribute('data-target');
        const details = document.getElementById(targetId);
        if (details) {
          const isExpanded = header.getAttribute('aria-expanded') === 'true';
          header.setAttribute('aria-expanded', !isExpanded);
          details.style.display = isExpanded ? 'none' : 'block';
          header.classList.toggle('ppg-expanded', !isExpanded);
        }
      };
      header.addEventListener('click', handleExpand);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleExpand();
        }
      });
    });

    // Block cookie buttons
    const blockBtns = this.modal.querySelectorAll('.ppg-block-cookie-btn');
    blockBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cookieName = btn.getAttribute('data-cookie');
        const cookieDomain = btn.getAttribute('data-domain');
        this.blockCookie(cookieName, cookieDomain, btn);
      });
    });

    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    firstFocusable.focus();

    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  hide() {
    if (!this.isVisible) return;

    this.modal.classList.remove('ppg-modal-visible');

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.isVisible = false;
    }, 300);
  }

  blockCookie(cookieName, cookieDomain, buttonElement) {
    try {
      // Delete the cookie by setting it to expire in the past
      const domain = cookieDomain || window.location.hostname;
      const paths = ['/', window.location.pathname];

      paths.forEach(path => {
        // Try different domain variations
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=.${domain};`;
      });

      // Also try to remove via Chrome cookies API
      chrome.runtime.sendMessage({
        type: 'blockCookie',
        cookieName: cookieName,
        domain: domain,
        url: window.location.href
      });

      // Update UI to show blocked
      buttonElement.classList.add('ppg-blocked');
      buttonElement.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Blocked
      `;
      buttonElement.disabled = true;

      // Mark the row as blocked
      const row = buttonElement.closest('.ppg-cookie-detail-row');
      if (row) {
        row.classList.add('ppg-row-blocked');
      }

      this.sendAnalytics('cookie_blocked', { cookie: cookieName, domain: domain });
    } catch (e) {
      console.error('[Privacy Pulse] Error blocking cookie:', e);
      buttonElement.textContent = 'Error';
    }
  }

  sendAnalytics(event, data = {}) {
    try {
      chrome.runtime.sendMessage({
        type: 'analytics',
        event: event,
        data: data,
        url: window.location.href,
        timestamp: Date.now()
      });
    } catch (e) {
    }
  }
}

if (typeof window !== 'undefined') {
  window.WarningModal = WarningModal;
}
