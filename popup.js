document.addEventListener("DOMContentLoaded", () => {
  const flagResponseElement = document.getElementById("flagResponse");
  const retryButton = document.getElementById("retryButton");

  const updateFlagResponse = (response) => {
    if (response) {
      flagResponseElement.textContent = JSON.stringify(response, null, 2);
    } else {
      flagResponseElement.textContent = "No LaunchDarkly request detected.";
    }
  };

  chrome.runtime.sendMessage({ type: "getFlagResponse" }, (response) => {
    updateFlagResponse(response);
  });

  retryButton.addEventListener("click", () => {
    flagResponseElement.textContent = "Looking for a new request...";
    chrome.runtime.sendMessage({ type: "retry" });
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "updatePopup") {
      chrome.runtime.sendMessage({ type: "getFlagResponse" }, (response) => {
        updateFlagResponse(response);
      });
    }
  });
});
