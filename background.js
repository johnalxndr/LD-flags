let flagResponse = null;
let retryRequested = false;

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
          chrome.runtime.sendMessage({ type: "updatePopup" });
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
  }
});
