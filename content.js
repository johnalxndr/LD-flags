if (typeof interceptedFlags === 'undefined') {
    console.log("Content script loaded");

    let interceptedFlags = null;

    // Function to intercept the LaunchDarkly API call
    function interceptLDApiCall() {
        console.log("Intercepting LD API calls");
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource, config] = args;
            
            // Check if this is the LaunchDarkly API call
            if (resource.includes('launchdarkly.com/sdk/evalx')) {
                console.log("LaunchDarkly API call detected");
                const response = await originalFetch(resource, config);
                const clonedResponse = response.clone();
                
                try {
                    const data = await clonedResponse.json();
                    interceptedFlags = data;
                    console.log("Intercepted LaunchDarkly flags:", interceptedFlags);
                    // Dispatch a custom event with the intercepted flags
                    window.dispatchEvent(new CustomEvent('launchDarklyFlagsIntercepted', { detail: interceptedFlags }));
                } catch (error) {
                    console.error("Error parsing LaunchDarkly response:", error);
                }

                return response;
            }

            // For all other requests, just use the original fetch
            return originalFetch(resource, config);
        };
    }

    // Inject the interception script
    function injectInterceptScript() {
        console.log("Injecting intercept script");
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('interceptor.js');
        (document.head || document.documentElement).appendChild(script);
        script.onload = function() {
            this.remove();
            // Call interceptLDApiCall after the script is loaded
            interceptLDApiCall();
            console.log("Intercept script loaded and removed");
        };
    }

    // Inject the interception script immediately
    injectInterceptScript();

    // Listen for the custom event from the injected script
    window.addEventListener('launchDarklyFlagsIntercepted', function(event) {
        interceptedFlags = event.detail;
        console.log("Flags received in content script:", interceptedFlags);
    });

    // Function to get all flags
    function getAllFlags() {
        console.log('getAllFlags called');
        if (interceptedFlags) {
            console.log('Returning intercepted flags:', interceptedFlags);
            return interceptedFlags;
        } else {
            console.log('No intercepted flags found, checking window.LDClient');
            if (window.LDClient && window.LDClient.flags) {
                console.log('LDClient found, getting flags');
                const flags = window.LDClient.flags.allFlags();
                console.log('Flags found from LDClient:', flags);
                return flags;
            }
            console.log('No LDClient found, checking for global LD variable');
            if (window.LD && window.LD.client) {
                console.log('Global LD variable found, getting flags');
                const flags = window.LD.client.allFlags();
                console.log('Flags found from global LD variable:', flags);
                return flags;
            }
            console.log('No flags found');
            return null;
        }
    }

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Message received in content script:", message);
        if (message.action === 'getAllFlags') {
            const flags = getAllFlags();
            console.log('Sending flags to popup:', flags);
            sendResponse(flags);
        }
        return true;  // Indicates that the response is sent asynchronously
    });

    console.log("Content script fully loaded");
}
