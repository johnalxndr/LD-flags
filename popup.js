document.addEventListener("DOMContentLoaded", () => {
  const flagResponseElement = document.getElementById("flagResponse");
  const retryButton = document.getElementById("retryButton");
  const searchInput = document.getElementById("searchInput");

  let allFlags = {};

  const updateFlagResponse = (response) => {
    if (response) {
      allFlags = response;
      renderFlags(allFlags);
    } else {
      flagResponseElement.textContent = "No LaunchDarkly request detected. Click refresh and keep this open";
    }
  };

  const renderFlags = (flags) => {
    if (Object.keys(flags).length === 0) {
      flagResponseElement.textContent = "No matching flags found.";
      return;
    }

    let tableHTML = '<table class="flag-table"><tr><th>Flag Name</th><th>Value</th></tr>';
    Object.entries(flags).forEach(([flagName, flagData]) => {
      const valueClass = flagData.value === true ? 'true-value' : 
                         flagData.value === false ? 'false-value' : 'other-value';
      tableHTML += `
        <tr class="flag-item">
          <td class="flag-name">${flagName}</td>
          <td class="flag-value ${valueClass}">${flagData.value}</td>
        </tr>
      `;
    });
    tableHTML += '</table>';
    flagResponseElement.innerHTML = tableHTML;
  };

  const filterFlags = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredFlags = Object.fromEntries(
      Object.entries(allFlags).filter(([flagName]) => 
        flagName.toLowerCase().includes(searchTerm)
      )
    );
    renderFlags(filteredFlags);
  };

  searchInput.addEventListener("input", filterFlags);

  const getFlagResponse = () => {
    chrome.runtime.sendMessage({ type: "getFlagResponse" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting flag response:", chrome.runtime.lastError);
        flagResponseElement.textContent = "Error getting flags. Please try again.";
      } else {
        updateFlagResponse(response);
      }
    });
  };

  // Check for updates when popup opens
  chrome.storage.local.get(['updateAvailable'], (result) => {
    if (result.updateAvailable) {
      getFlagResponse();
      chrome.storage.local.set({updateAvailable: false});
    } else {
      getFlagResponse();
    }
  });

  retryButton.addEventListener("click", () => {
    flagResponseElement.textContent = "Looking for a new request...";
    sendRetryMessage();
  });

  function sendRetryMessage(retryCount = 0) {
    chrome.runtime.sendMessage({ type: "retry" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending retry message:", chrome.runtime.lastError);
        if (retryCount < 3) {
          setTimeout(() => sendRetryMessage(retryCount + 1), 1000);
        } else {
          flagResponseElement.textContent = "Error refreshing flags. Please try again or reload the extension.";
        }
      } else {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      }
    });
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "updatePopup") {
      getFlagResponse();
    }
  });

  // Check connection to background script
  function checkBackgroundConnection() {
    chrome.runtime.sendMessage({ type: "ping" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Background script not responding:", chrome.runtime.lastError);
        flagResponseElement.textContent = "Extension disconnected. Please reload the extension.";
      }
    });
  }

  // Check connection every 5 seconds
  setInterval(checkBackgroundConnection, 5000);
});

console.log("Popup script loaded");
