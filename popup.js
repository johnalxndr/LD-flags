document.addEventListener('DOMContentLoaded', () => {
  const flagList = document.getElementById('flagList');
  const searchInput = document.getElementById('searchInput');
  const refreshButton = document.getElementById('refreshButton');

  let allFlags = {};

  // Function to update the UI with feature flags
  function updateFlagList(flags, searchTerm = '') {
    flagList.innerHTML = '';
    const sortedFlags = Object.entries(flags)
      .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[0].localeCompare(b[0]));

    for (const [name, flagData] of sortedFlags) {
      const flagElement = document.createElement('div');
      flagElement.className = 'flag-item';
      flagElement.innerHTML = `
        <span title="${name}">${name}</span>
        <span>${flagData.value}</span>
      `;
      flagList.appendChild(flagElement);
    }
  }

  // Function to fetch flags from LaunchDarkly
  async function fetchFlags() {
    flagList.innerHTML = 'Loading flags...';

    try {
      // These values should be extracted dynamically from the actual LaunchDarkly request
      const envId = '5bfbf59404cc784b24b86583';
      const encodedContext = 'eyJrZXkiOiI1NjUyZTkxZWQ0NDg2ZjY4MTc1NGZkMzMiLCJlbWFpbCI6ImpvaG5Ac2hvZmxvLnR2IiwiY3VzdG9tIjp7ImNyZWF0ZWRPbiI6MTQzMzE5NjgxNTQyOX0sInByaXZhdGVBdHRyaWJ1dGVOYW1lcyI6WyJlbWFpbCJdLCJmaXJzdE5hbWUiOiJKb2huIn0';

      const response = await fetch(`https://app.launchdarkly.com/sdk/evalx/${envId}/contexts/${encodedContext}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        allFlags = data;
        updateFlagList(allFlags);
      } else {
        flagList.textContent = 'No flags found.';
      }
    } catch (error) {
      flagList.textContent = 'Error loading flags.';
      console.error(error);
    }
  }

  // Initial fetch of flags
  fetchFlags();

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    updateFlagList(allFlags, e.target.value);
  });

  // Refresh button
  refreshButton.addEventListener('click', fetchFlags);
});
