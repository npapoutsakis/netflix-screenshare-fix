document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('toggle-fix');
    const statusText = document.getElementById('status-text');

    // Key to use for local storage in the page context
    const STORAGE_KEY = 'netflix-fix-enabled';

    // Function to get state from the active tab
    async function getTabState() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Filter out internal pages and empty states
        if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
            // Disable the toggle if we are on a restricted page
            toggle.disabled = true;
            statusText.textContent = "Restricted Page";
            statusText.style.color = "#999";
            return false;
        }

        try {
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (key) => window.localStorage.getItem(key),
                args: [STORAGE_KEY],
                world: 'MAIN' // Access the page's localStorage directly
            });
            
            // If null, it means it's never been set, so we default to "enabled" (true)
            const val = result[0].result;
            return val === null ? true : (val === 'true');
        } catch (e) {
            console.error(e);
            return true; // Default
        }
    }

    // Function to set state in the active tab
    async function setTabState(isEnabled) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) return;

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (key, val) => window.localStorage.setItem(key, val),
                args: [STORAGE_KEY, isEnabled.toString()],
                world: 'MAIN'
            });
        } catch (e) {
            console.error(e);
        }
    }

    function updateUI(isEnabled) {
        toggle.checked = isEnabled;
        statusText.textContent = isEnabled ? "Enabled" : "Disabled";
        
        // Toggle inactive class for styling
        if (isEnabled) {
            statusText.classList.remove('inactive');
        } else {
            statusText.classList.add('inactive');
        }
    }

    // Initialize
    const isEnabled = await getTabState();
    updateUI(isEnabled);

    // Toggle Handler
    toggle.addEventListener('change', async (e) => {
        const newState = e.target.checked;
        updateUI(newState);
        await setTabState(newState);
        
        // Auto-refresh the page to apply changes
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            chrome.tabs.reload(tab.id);
            // Close the popup since the page is reloading
            window.close();
        }
    });
});
