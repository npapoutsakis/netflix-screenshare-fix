chrome.runtime.onInstalled.addListener(() => {
    // Disable the action by default
    chrome.action.disable();

    // Enable the action only on specific domains
    const rules = {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostSuffix: '.netflix.com' },
            }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
    };

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([rules]);
    });
});
