let currentTabId = null;

// Function to inject content script
function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error injecting content script:', chrome.runtime.lastError);
    } else {
      console.log('Content script injected successfully into tab:', tabId);
    }
  });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  currentTabId = activeInfo.tabId;
  console.log('Tab activated:', currentTabId);
  injectContentScript(currentTabId);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.active) {
    currentTabId = tabId;
    console.log('Tab updated:', currentTabId);
    injectContentScript(currentTabId);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  if (message.action === 'getFlags') {
    if (currentTabId) {
      console.log('Sending getAllFlags message to tab:', currentTabId);
      chrome.tabs.sendMessage(currentTabId, { action: 'getAllFlags' }, (response) => {
        console.log('Received response from content script:', response);
        sendResponse(response);
      });
    } else {
      console.error('No current tab ID');
      sendResponse(null);
    }
    return true;  // Indicates that the response is sent asynchronously
  }
});
