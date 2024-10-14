(function() {
    // Intercept LDClient constructor
    const originalLDClient = window.LDClient;
    window.LDClient = function(...args) {
        const client = new originalLDClient(...args);
        window.LDClient.flags = client;
        return client;
    };

    // Intercept fetch API
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const [resource, config] = args;
        
        if (resource.includes('launchdarkly.com/sdk/evalx')) {
            const response = await originalFetch(resource, config);
            const clonedResponse = response.clone();
            
            clonedResponse.json().then(data => {
                window.dispatchEvent(new CustomEvent('launchDarklyFlagsIntercepted', { detail: data }));
            });

            return response;
        }

        return originalFetch(resource, config);
    };

    // Check for LDClient and intercept if available
    function checkForLDClient() {
        if (window.LDClient && window.LDClient.flags) {
            const flags = window.LDClient.flags.allFlags();
            window.dispatchEvent(new CustomEvent('launchDarklyFlagsIntercepted', { detail: flags }));
        }
    }

    // Check periodically for LDClient
    const checkInterval = setInterval(checkForLDClient, 1000);

    // Stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
})();
