# Cookie Consent Guardian

A privacy-focused Chrome extension that intercepts cookie consent banners and shows you exactly what you're agreeing to before you click "Accept All."

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## What It Does

Ever click "Accept All" on cookie banners without knowing what you're agreeing to? This extension:

- **Intercepts** the "Accept All" button before it triggers
- **Analyzes** the cookies and trackers on the page
- **Shows you** a privacy score (0-100) and detailed breakdown
- **Lets you decide** to Accept, Reject, or Customize your preferences

## Installation

1. **Download** this repository:
   - Click the green **Code** button above
   - Select **Download ZIP**
   - Extract the ZIP file to a folder on your computer

2. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the extracted folder

3. **You're done!** The extension icon will appear in your toolbar.

## How to Use

### Automatic Protection
Just browse normally. When you visit a site with a cookie banner and click "Accept All," the extension will intercept and show you:
- Privacy score for the site
- Number of cookies by category (Essential, Analytics, Advertising)
- Detected trackers
- What data will be collected

### View Any Site's Data
Click the extension icon in your toolbar, then click **View Site Data** to see a complete privacy analysis of any website you're on.

### Your Options
When the warning appears, you can:
- **Reject All** - Block non-essential cookies
- **Customize** - Open the site's cookie settings
- **Accept Anyway** - Proceed with accepting all cookies

Your choice is remembered for each site.

## Features

| Feature | Description |
|---------|-------------|
| Smart Detection | Detects banners from OneTrust, Cookiebot, TrustArc, Quantcast, Osano, CookieYes, and custom implementations |
| Privacy Score | 0-100 score based on cookies, trackers, and third-party domains |
| Raw Data View | See all cookies, localStorage, and sessionStorage in table format |
| Preference Memory | Remembers your choice per website |
| Tracker Detection | Identifies Google Analytics, Facebook Pixel, advertising networks, and more |

## Privacy Score Explained

| Score | Rating | Meaning |
|-------|--------|---------|
| 75-100 | Good | Minimal tracking, mostly essential cookies |
| 50-74 | Moderate | Some analytics and third-party cookies |
| 0-49 | Poor | Heavy tracking, multiple advertising cookies |

## Screenshots

*Extension popup showing site status and statistics*

*Warning modal with privacy analysis*

## FAQ

**Q: Does this block all cookies?**
A: No. It educates you about cookies but doesn't automatically block them. You choose what to accept.

**Q: Does the extension collect my data?**
A: No. All analysis happens locally in your browser. Nothing is sent anywhere.

**Q: Why doesn't it work on some sites?**
A: Some sites use custom cookie banners that aren't detected. You can still use "View Site Data" to see what's on the page.

## Permissions Explained

| Permission | Why It's Needed |
|------------|-----------------|
| storage | Save your preferences and statistics |
| activeTab | Analyze the current page |
| scripting | Inject the analysis scripts |
| cookies | Read cookie information |
| host_permissions | Work on any website |

## Troubleshooting

- **Extension not working?** Reload the page or restart Chrome
- **Modal not appearing?** The site may use an unrecognized cookie banner
- **Stats not saving?** Make sure you're not in Incognito mode

## Support

Having issues? [Open an issue](https://github.com/EthanY33/Cookie-Consent-Guardian/issues) on GitHub.

## License

MIT License - Free to use and modify.

---

**Version**: 1.0.2
**Last Updated**: January 2025

Made to promote digital privacy awareness.
