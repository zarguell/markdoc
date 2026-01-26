// Code wrapping control module

const STORAGE_KEY = 'browsermark.codeWrapEnabled';
const CSS_VAR_NAME = '--code-wrap-mode';
const WRAPPED_CLASS = 'wrapped';

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

        // Update all code blocks that don't have per-block overrides
        const allPreElements = document.querySelectorAll('#preview-content pre');
        allPreElements.forEach(pre => {
            if (!pre.hasAttribute('data-wrap-override')) {
                updatePreElementWrap(pre, enabled);
            }
        });
    } catch (error) {
        console.error('Failed to set global wrap state:', error);
    }
}

// Toggle wrap state for a specific code block
function toggleBlockWrap(preElement) {
    if (!preElement || preElement.tagName !== 'PRE') {
        console.warn('Invalid pre element provided to toggleBlockWrap');
        return;
    }

    const currentState = preElement.classList.contains(WRAPPED_CLASS);

    // Set per-block override
    preElement.setAttribute('data-wrap-override', 'true');

    // Toggle the wrapped state
    updatePreElementWrap(preElement, !currentState);

    // Update the toggle button if it exists
    const button = preElement.querySelector('.code-wrap-toggle');
    if (button) {
        updateButtonState(button, !currentState);
    }
}

// Update a pre element's wrap state
function updatePreElementWrap(preElement, wrapped) {
    if (wrapped) {
        preElement.classList.add(WRAPPED_CLASS);
    } else {
        preElement.classList.remove(WRAPPED_CLASS);
    }
}

// Update button visual state
function updateButtonState(button, isWrapped) {
    if (isWrapped) {
        button.textContent = '⟲ unwrap';
        button.setAttribute('title', 'Disable wrapping for this code block');
    } else {
        button.textContent = '⟳ wrap';
        button.setAttribute('title', 'Enable wrapping for this code block');
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
    toggleBlockWrap,
    initialize
};
