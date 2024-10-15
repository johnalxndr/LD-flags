# Feature Flags Viewer Chrome Extension

This Chrome extension allows you to view and search LaunchDarkly feature flags for the current page.

## Installation Instructions

Since this extension is not published on the Chrome Web Store, you'll need to install it manually. Follow these steps:

1. **Download the extension files**

   - Download or clone files and put them in a folder on your computer.
   - Make sure you have the following files:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `background.js`
     - `styles.css`

2. **Open Chrome Extensions page**

   - Open Google Chrome browser
   - Go to `chrome://extensions/`
   - Or, from the Chrome menu, go to More Tools > Extensions

3. **Enable Developer Mode**

   - In the top right corner of the Extensions page, toggle on "Developer mode"

4. **Load the extension**

   - Click on "Load unpacked" button that appears after enabling Developer mode
   - Navigate to the folder where you saved the extension files
   - Select the folder and click "Select Folder"

5. **Pin the extension**

   - Click on the puzzle piece icon in the Chrome toolbar to open the extensions menu
   - Find "Feature Flags Viewer" in the list
   - Click the pin icon next to it to pin the extension to your toolbar for easy access

## Usage

1. Navigate to a website that uses LaunchDarkly feature flags
2. Click on the Feature Flags Viewer extension icon in your Chrome toolbar
3. The popup will show the current feature flags
4. Use the search bar to filter flags by name
5. Click the "Refresh" button to update the flags (you may need to keep the popup open to capture new requests)

## Troubleshooting

- If you don't see any flags, try refreshing the page while keeping the extension popup open
- Make sure you're on a page that actually uses LaunchDarkly feature flags
- If you make changes to the extension code, remember to click the "Reload" button next to the extension on the `chrome://extensions/` page
