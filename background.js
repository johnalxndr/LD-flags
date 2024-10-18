let flagResponse = null;
let retryRequested = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.type === "getFlagResponse") {
    sendResponse(flagResponse);
  } else if (request.type === "retry") {
    flagResponse = null;
    retryRequested = true;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
    sendResponse({success: true});
  } else if (request.type === "ping") {
    sendResponse({status: "alive"});
  }
  return true; // Keep the message channel open for asynchronous responses
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("https://app.launchdarkly.com/sdk/evalx/")) {
      fetch(details.url, { 
        credentials: "include",
        headers: {
          "Origin": details.initiator
        }
      })
        .then((response) => response.json())
        .then((data) => {
          flagResponse = data;
          // Instead of sending a message, we'll set a flag in storage
          chrome.storage.local.set({updateAvailable: true}, () => {
            console.log("Update flag set");
          });
        })
        .catch((error) => console.error("Error fetching LaunchDarkly response:", error));
    }
  },
  { urls: ["*://app.launchdarkly.com/*"] },
  ["responseHeaders"]
);

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {  // Main frame
    retryRequested = true;
  }
});

// Keep the service worker alive
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('Background script kept alive');
  }
});

console.log("Background script loaded");
