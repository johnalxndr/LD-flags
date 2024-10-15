let flagResponse = null;
let retryRequested = false;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (retryRequested && details.url.includes("https://app.launchdarkly.com/sdk/evalx/")) {
      fetch(details.url, { credentials: "include" })
        .then((response) => response.json())
        .then((data) => {
          flagResponse = data;
          retryRequested = false; // Reset retry request
          chrome.runtime.sendMessage({ type: "updatePopup" });
        })
        .catch((error) => console.error("Error fetching LaunchDarkly response:", error));
    }
  },
  { urls: ["*://app.launchdarkly.com/*"] }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getFlagResponse") {
    sendResponse(flagResponse);
  } else if (request.type === "retry") {
    flagResponse = null;
    retryRequested = true;
    chrome.runtime.sendMessage({ type: "updatePopup" });
  }
});
