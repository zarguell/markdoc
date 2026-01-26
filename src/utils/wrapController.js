// Code wrapping control module

const STORAGE_KEY = 'browsermark.codeWrapEnabled';
const CSS_VAR_NAME = '--code-wrap-mode';

// Get global wrap state from localStorage
function getGlobalWrapState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'true';
    } catch (error) {
        console.error('Failed to read wrap state from localStorage:', error);
        return false;
    }
}

// Set global wrap state
function setGlobalWrap(enabled) {
    try {
        localStorage.setItem(STORAGE_KEY, String(enabled));

        // Update CSS custom property
        const root = document.documentElement;
        root.style.setProperty(CSS_VAR_NAME, enabled ? 'pre-wrap' : 'nowrap');
    } catch (error) {
        console.error('Failed to set global wrap state:', error);
    }
}

// Initialize wrap controller on page load
function initialize() {
    // Set initial state from localStorage
    const initialState = getGlobalWrapState();
    setGlobalWrap(initialState);

    return initialState;
}

// Export functions
export {
    getGlobalWrapState,
    setGlobalWrap,
    initialize
};
