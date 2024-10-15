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
      flagResponseElement.textContent = "No LaunchDarkly request detected. click refresh and keep this open";
    }
  };

  const renderFlags = (flags) => {
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

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredFlags = Object.fromEntries(
      Object.entries(allFlags).filter(([flagName]) => 
        flagName.toLowerCase().includes(searchTerm)
      )
    );
    renderFlags(filteredFlags);
  });

  chrome.runtime.sendMessage({ type: "getFlagResponse" }, (response) => {
    updateFlagResponse(response);
  });

  retryButton.addEventListener("click", () => {
    flagResponseElement.textContent = "Looking for a new request...";
    chrome.runtime.sendMessage({ type: "retry" });

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "updatePopup") {
      chrome.runtime.sendMessage({ type: "getFlagResponse" }, (response) => {
        updateFlagResponse(response);
      });
    }
  });
});
