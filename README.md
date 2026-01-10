# Privacy Pulse Guardian

A Chrome extension that intercepts and educates users about cookie consent banners, helping them make informed privacy decisions.

## Features

- **🔍 Smart Detection**: Automatically detects cookie consent banners from major platforms (OneTrust, Cookiebot, TrustArc, Quantcast, Osano, CookieYes) and custom implementations
- **🛡️ Click Interception**: Intercepts "Accept All" button clicks before they execute
- **📊 Educational Warnings**: Shows detailed information about:
  - Number and types of cookies (Essential, Analytics, Advertising, Third-party)
  - Plain language explanations of data collection
  - List of companies receiving your data
  - Privacy score for the website
- **⚙️ User Control**: Options to "Reject All", "Customize", or "Accept Anyway"
- **📈 Statistics Tracking**: Monitors banners intercepted, cookies rejected, and sites protected
- **💾 Preference Memory**: Remembers your choices per domain

## Installation

### From Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `PrivacyPulse` folder

### Icon Setup

The extension requires icons in the following sizes:
- 16x16 pixels
- 32x32 pixels
- 48x48 pixels
- 128x128 pixels

Place PNG icons in the `icons/` directory with the following names:
- `icon16.png`
- `icon32.png`
- `icon48.png`
- `icon128.png`

You can create these icons using any image editor or online icon generator. The icon should represent privacy/security (e.g., a shield, lock, or eye).

## File Structure

```
PrivacyPulse/
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js          # Service worker for state management
├── content.js            # Main content script orchestrating detection
├── cookie-detector.js    # Banner detection and cookie analysis
├── warning-modal.js      # Educational warning overlay component
├── popup.html           # Extension popup interface
├── popup.js            # Popup logic and stats display
├── styles.css          # Injected styles for modal and indicators
├── icons/             # Extension icons (16, 32, 48, 128 px)
└── README.md         # This file
```

## How It Works

1. **Detection**: When you visit a website, the extension scans for cookie consent banners using pattern matching
2. **Interception**: If an "Accept All" button is detected, click events are intercepted
3. **Analysis**: The extension analyzes cookies, trackers, and third-party domains
4. **Education**: A warning modal displays detailed privacy information and a privacy score
5. **Choice**: You decide whether to reject, customize, or accept the cookies
6. **Memory**: Your preference is saved for future visits to that domain

## Supported Platforms

- **OneTrust**: Market-leading consent management platform
- **Cookiebot**: Popular GDPR/CCPA compliance solution
- **TrustArc**: Enterprise privacy management
- **Quantcast**: Choice consent management
- **Osano**: Privacy compliance platform
- **CookieYes**: Cookie consent banner solution
- **Custom**: Generic detection for custom implementations

## Privacy Score

The extension calculates a privacy score (0-100) based on:
- Number of analytics cookies (-3 points each, max -15)
- Number of advertising cookies (-5 points each, max -25)
- Number of third-party domains (-4 points each, max -20)
- Number of trackers detected (-3 points each, max -30)
- HTTPS usage (+5 bonus points)

## Permissions

The extension requires the following permissions:

- **storage**: Save user preferences and statistics
- **activeTab**: Interact with the current tab
- **scripting**: Inject content scripts
- **host_permissions** (`<all_urls>`): Detect banners on any website

## Development

### Prerequisites

- Chrome browser (v88+)
- Basic knowledge of JavaScript, HTML, CSS

### Testing

1. Load the extension in developer mode
2. Visit websites with cookie banners (e.g., news sites, blogs)
3. Open the browser console to see debug logs
4. Click "Accept All" buttons to trigger the warning modal

### Debugging

- **Content Script**: Open the page's console (F12)
- **Background Script**: Navigate to `chrome://extensions/`, find the extension, click "service worker"
- **Popup**: Right-click the extension icon → "Inspect popup"

## Contributing

Contributions are welcome! Areas for improvement:

- Add support for more consent platforms
- Improve cookie categorization
- Enhance privacy score algorithm
- Add internationalization (i18n)
- Create comprehensive test suite
- Improve visual design

## Known Limitations

- Cannot detect consent banners in iframes from different origins (browser security restriction)
- Some heavily obfuscated consent implementations may not be detected
- Privacy score is an estimate based on visible cookies and scripts
- Cannot prevent all forms of tracking (e.g., fingerprinting)

## Future Enhancements

- [ ] Machine learning-based banner detection
- [ ] Automatic rejection based on user preferences
- [ ] Export privacy reports
- [ ] Browser fingerprinting detection
- [ ] Integration with Privacy Badger/uBlock Origin
- [ ] Multi-language support
- [ ] Custom privacy policy analyzer

## License

MIT License - feel free to modify and distribute

## Disclaimer

This extension is for educational purposes and to promote privacy awareness. It does not guarantee complete protection from tracking. Always review privacy policies and use additional privacy tools for comprehensive protection.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure you're using the latest version of Chrome

## Acknowledgments

Built to promote digital privacy awareness and help users make informed decisions about their online data.

---

**Version**: 1.0.2
**Last Updated**: January 2025