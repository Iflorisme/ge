# Linkvertise Solver

A single-page web application that helps users extract destination URLs from Linkvertise links.

## Features

- **Clean, Modern Interface**: Responsive design that works on desktop and mobile devices
- **Linkvertise Detection**: Validates input and checks for Linkvertise domains automatically
- **Multiple Extraction Strategies**: 
  - Query-string target extraction
  - Encoded path/base64/hex decoding
  - Linkvertise static API lookups
  - Fallback to community bypass APIs when direct extraction fails
- **User-Friendly Experience**: 
  - Clear status messaging and graceful error handling
  - Loading indicators during network calls
  - Copy-to-clipboard shortcut with toast confirmations
  - Accessible form controls with ARIA attributes
- **Cross-Browser Support**: Works in Chrome, Firefox, Safari, and Edge

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

## Disclaimer

This tool is provided for educational purposes only. Please respect website terms of service and content creator revenue models.

## License

Educational use only.
