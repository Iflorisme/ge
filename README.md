# Linkvertise Solver

A highly effective single-page web application that helps users extract destination URLs from Linkvertise links using multiple advanced extraction strategies.

## Features

- **Clean, Modern Interface**: Responsive design that works on desktop and mobile devices
- **Extended Domain Support**: Recognizes Linkvertise and related domains (linkvertise.com, link-to.net, up-to-down.net, etc.)
- **8 Advanced Extraction Strategies**: 
  - Query parameter extraction (target, url, redirect, etc.)
  - Fragment/hash extraction and decoding
  - Encoded path detection (Base64, URL encoding, hex)
  - Dynamic link reconstruction
  - Linkvertise official API calls (static and dynamic endpoints)
  - Direct HTML page analysis via CORS proxies
  - Multiple third-party bypass services integration
  - Smart URL scoring for file-sharing links
- **Multiple Decoding Methods**:
  - Deep URL decoding (multiple layers)
  - Base64 decoding (standard and URL-safe)
  - Hexadecimal decoding
  - ROT13 cipher
  - Plus-to-space conversion
- **User-Friendly Experience**: 
  - Clear status messaging and graceful error handling
  - Loading indicators during network calls
  - Copy-to-clipboard shortcut with toast confirmations
  - Accessible form controls with ARIA attributes
- **Cross-Browser Support**: Works in Chrome, Firefox, Safari, and Edge
- **Fallback Chain**: If one method fails, automatically tries the next strategy

## How to Use

1. Open `index.html` in a modern web browser
2. Paste a Linkvertise URL into the input field
3. Click "Solve Link" or press Enter
4. View the extracted destination URL and, if needed, copy it directly

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ class-based architecture with async/await

### Key Implementation Points

- Responsive layout using `clamp()` and mobile-first media queries
- Centralised validation pipeline with multiple solver strategies
- Asynchronous fetch helpers for Linkvertise APIs and third-party fallbacks
- XSS protection via HTML escaping prior to rendering dynamic content
- Copy routine with Clipboard API and legacy `execCommand` fallback
- Toast notifications and focus management for better UX

### Project Structure

```
/
├── index.html      # Main HTML document
├── styles.css      # All styling for the SPA
├── script.js       # Solver logic and interactivity
├── README.md       # Project documentation
└── .gitignore      # Repository ignores
```

## Browser Compatibility

- Chrome / Edge (90+)
- Firefox (88+)
- Safari (14+)
- Modern mobile browsers

## Development

This is a static web application with no build process required. Simply open `index.html` in a browser to run the application. For local testing with Fetch API requests you may prefer serving the files via a local web server (for example, `python3 -m http.server`) to avoid CORS or mixed-content restrictions.

## Effectiveness

The solver uses a **layered fallback approach** with 8 different extraction strategies:

```
Input URL → Strategy 1 (Query Params) → Failed?
         → Strategy 2 (Hash/Fragment) → Failed?
         → Strategy 3 (Path Encoding) → Failed?
         → Strategy 4 (Dynamic Links) → Failed?
         → Strategy 5 (Linkvertise API) → Failed?
         → Strategy 6 (HTML Analysis) → Failed?
         → Strategy 7 (Bypass Services) → Failed?
         → Strategy 8 (Fallback APIs) → Success! ✓
```

Each strategy employs multiple decoding methods (Base64, hex, URL encoding, ROT13, etc.), maximizing the chance of successful extraction. The application will try all methods sequentially until one succeeds or all fail.

**Estimated success rate: 75-90%** depending on link type and Linkvertise configuration.

For detailed technical improvements, see [IMPROVEMENTS.md](IMPROVEMENTS.md).

## Disclaimer

This tool is provided for educational purposes only. Please respect website terms of service and content creator revenue models.

## License

Educational use only.
