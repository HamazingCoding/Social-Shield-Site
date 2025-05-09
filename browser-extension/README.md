# Guardian Shield Browser Extension

## Overview
Guardian Shield is a powerful browser extension that protects users from social engineering attacks by detecting and blocking:
- AI-generated deepfake videos
- Synthetic voice content 
- Phishing websites and links

## Features
- **Real-time Protection**: Analyzes websites, links, videos, and audio as you browse
- **Deepfake Detection**: Scans videos for signs of AI manipulation
- **Voice AI Detection**: Identifies synthetically generated voice content
- **Phishing Protection**: Checks links and websites for phishing indicators
- **Customizable Settings**: Adjust sensitivity levels and protection features
- **Detailed Analysis**: View comprehensive reports for detected threats
- **Usage History**: Track previous scans and threats

## Installation
### Developer Mode Installation
1. Download or clone this repository
2. Create PNG versions of the SVG icons (required for the extension):
   ```bash
   # If you have ImageMagick installed:
   convert -background none icons/icon16.svg icons/icon16.png
   convert -background none icons/icon48.svg icons/icon48.png
   convert -background none icons/icon128.svg icons/icon128.png
   
   # If you don't have ImageMagick, manually create or download PNG versions of the icons
   ```
3. Open Chrome/Edge and navigate to `chrome://extensions`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the `browser-extension` folder
6. The Guardian Shield icon should appear in your browser toolbar

### API Server Configuration
The extension needs to communicate with the Guardian Shield API server:

1. Open `background.js` and update the API_URL to match your server:
   ```javascript
   // Find this line at the beginning of background.js and update it
   const API_URL = 'http://localhost:5000/api';
   ```

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Guardian Shield"
3. Click "Add to Chrome"

## Usage
1. Click the Guardian Shield icon in your browser toolbar to access the popup menu
2. Toggle protection features on/off as needed
3. Adjust the alert sensitivity level
4. Browse normally - Guardian Shield works automatically in the background
5. When a threat is detected, you'll receive a warning notification
6. View detailed analysis and recommendations for any detected threats
7. Access your protection history to review past scans

## Configuration
Guardian Shield can be customized through the popup menu:
- **Main Protection Toggle**: Enable/disable all protection features
- **Feature Toggles**: Control individual protection modules:
  - Phishing Detection
  - Deepfake Detection
  - Voice AI Detection
- **Auto-block Threats**: Choose whether to automatically block high-confidence threats
- **Alert Sensitivity**: Set to Low, Medium, or High based on your preferences

## Protection Details
### Phishing Detection
- Analyzes URLs for suspicious patterns
- Checks for common phishing indicators
- Warns about potential credential theft attempts

### Deepfake Detection
- Monitors video content for manipulation markers
- Identifies inconsistencies in facial movements
- Detects artificial patterns in video sequences

### Voice AI Detection
- Analyzes audio for synthetic voice characteristics
- Identifies unnatural speech patterns
- Detects AI-generated voice content

## Troubleshooting
If you encounter issues with the extension:

1. **Extension doesn't load**:
   - Make sure all required files are present (manifest.json, background.js, content.js, popup.html, etc.)
   - Check the browser console for errors (right-click the extension icon → Inspect)

2. **API connection fails**:
   - Verify that the Guardian Shield server is running
   - Check that the API_URL in background.js is correctly set to your server address
   - Ensure your server allows CORS requests from the extension

3. **Icons not displaying**:
   - Confirm that icon files exist in the correct format (PNG) and location
   - Regenerate PNG icons if needed

## Privacy
Guardian Shield respects your privacy:
- No data is shared with third parties
- Analysis is performed locally when possible
- Limited data is sent to the Guardian Shield API for advanced analysis
- No personal information is collected

## For Developers
This extension is built using:
- JavaScript
- Chrome Extension Manifest V3
- WebRTC (for media analysis)
- SVG and CSS for the user interface

### Project Structure
- `manifest.json`: Extension configuration
- `background.js`: Service worker for background tasks
- `content.js`: Content script for page analysis
- `popup.html/js`: User interface for the extension
- `warning.html`: Security warning page
- `icons/`: Extension icons

## Support
For support, feature requests, or bug reports, please contact the Guardian Shield team or open an issue in the GitHub repository.

## License
This project is licensed under the MIT License - see the LICENSE file for details.