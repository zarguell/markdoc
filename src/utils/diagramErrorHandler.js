/**
 * diagramErrorHandler - Comprehensive error handling for diagram rendering
 * Provides timeout support, friendly error messages, and error recovery
 */

/**
 * Error types for diagram rendering
 */
export const DiagramErrorType = {
  SYNTAX_ERROR: 'syntax_error',
  LIBRARY_LOAD_ERROR: 'library_load_error',
  RENDER_TIMEOUT: 'render_timeout',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Custom error class for diagram rendering errors
 */
export class DiagramRenderError extends Error {
  constructor(message, type = DiagramErrorType.UNKNOWN_ERROR, originalError = null) {
    super(message);
    this.name = 'DiagramRenderError';
    this.type = type;
    this.originalError = originalError;
  }

  /**
   * Get user-friendly error message
   * @returns {string} - User-friendly error message
   */
  getUserMessage() {
    switch (this.type) {
      case DiagramErrorType.SYNTAX_ERROR:
        return `The diagram syntax is invalid. Please check your diagram code for errors.`;
      case DiagramErrorType.LIBRARY_LOAD_ERROR:
        return `Failed to load the diagram library. Please check your internet connection.`;
      case DiagramErrorType.RENDER_TIMEOUT:
        return `The diagram took too long to render. Try simplifying it.`;
      default:
        return `An unexpected error occurred while rendering the diagram.`;
    }
  }

  /**
   * Get detailed error message for debugging
   * @returns {string} - Detailed error message
   */
  getDebugMessage() {
    let message = `${this.type}: ${this.message}`;
    if (this.originalError) {
      message += `\n\nOriginal error: ${this.originalError.message}`;
      if (this.originalError.stack) {
        message += `\n\nStack trace:\n${this.originalError.stack}`;
      }
    }
    return message;
  }
}

/**
 * Timeout wrapper for async operations
 * @param {Promise} promise - The promise to wrap with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operation - Description of the operation for error message
 * @returns {Promise} - Promise that rejects if timeout is exceeded
 */
export function withTimeout(promise, timeoutMs, operation = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new DiagramRenderError(
          `${operation} timed out after ${timeoutMs}ms`,
          DiagramErrorType.RENDER_TIMEOUT
        ));
      }, timeoutMs);
    })
  ]);
}

/**
 * Wrap renderer with comprehensive error handling
 * @param {Function} renderFunction - The render function to wrap
 * @param {string} language - The diagram language name
 * @param {Object} options - Options for error handling
 * @param {number} options.timeoutMs - Timeout in milliseconds (default: 30000)
 * @param {boolean} options.enableTimeout - Enable timeout protection (default: true)
 * @returns {Function} - Wrapped render function with error handling
 */
export function withErrorHandling(renderFunction, language, options = {}) {
  const {
    timeoutMs = 30000,
    enableTimeout = true
  } = options;

  return async function safeRender(code) {
    try {
      // Create the render promise
      const renderPromise = renderFunction.call(this, code);

      // Apply timeout if enabled
      const result = enableTimeout
        ? await withTimeout(renderPromise, timeoutMs, `${language} diagram rendering`)
        : await renderPromise;

      return result;
    } catch (error) {
      // Determine error type
      let errorType = DiagramErrorType.UNKNOWN_ERROR;
      let userMessage = error.message;

      // Check for syntax errors
      if (isSyntaxError(error, language)) {
        errorType = DiagramErrorType.SYNTAX_ERROR;
        userMessage = extractSyntaxErrorMessage(error, language);
      }
      // Check for library loading errors
      else if (isLibraryLoadError(error)) {
        errorType = DiagramErrorType.LIBRARY_LOAD_ERROR;
        userMessage = extractLibraryLoadErrorMessage(error);
      }
      // Check for timeout errors (already wrapped)
      else if (error instanceof DiagramRenderError && error.type === DiagramErrorType.RENDER_TIMEOUT) {
        errorType = DiagramErrorType.RENDER_TIMEOUT;
      }

      // Create and throw enhanced error
      throw new DiagramRenderError(
        userMessage,
        errorType,
        error instanceof DiagramRenderError ? error.originalError : error
      );
    }
  };
}

/**
 * Detect if error is a syntax error
 * @param {Error} error - The error to check
 * @param {string} language - The diagram language
 * @returns {boolean} - True if error is a syntax error
 */
function isSyntaxError(error, language) {
  const message = error.message?.toLowerCase() || '';

  // Common syntax error patterns by library
  const patterns = {
    mermaid: ['syntax', 'parse', 'no diagram type detected', 'strange syntax'],
    dot: ['syntax', 'parse', 'syntax error in line'],
    graphviz: ['syntax', 'parse'],
    nomnoml: ['parse', 'syntax'],
    pikchr: ['parse', 'syntax', 'invalid']
  };

  const languagePatterns = patterns[language.toLowerCase()] || [];

  return languagePatterns.some(pattern => message.includes(pattern));
}

/**
 * Detect if error is a library load error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if error is a library load error
 */
function isLibraryLoadError(error) {
  const message = error.message?.toLowerCase() || '';

  return message.includes('failed to load') ||
         message.includes('failed to initialize') ||
         message.includes('network') ||
         message.includes('404') ||
         message.includes('fetch') ||
         message.includes('import');
}

/**
 * Extract user-friendly syntax error message
 * @param {Error} error - The error
 * @param {string} language - The diagram language
 * @returns {string} - User-friendly error message
 */
function extractSyntaxErrorMessage(error, language) {
  // Try to extract specific line/position information from error
  const message = error.message || '';

  // For Mermaid, it often provides line numbers
  const lineMatch = message.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return `Syntax error at line ${lineMatch[1]}. Please check your ${language} diagram code.`;
  }

  return `Invalid ${language} diagram syntax. Please check your code for errors.`;
}

/**
 * Extract user-friendly library load error message
 * @param {Error} error - The error
 * @returns {string} - User-friendly error message
 */
function extractLibraryLoadErrorMessage(error) {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('cdn') || message.includes('network')) {
    return 'Could not load diagram library from CDN. Check your internet connection.';
  }

  return 'Failed to load diagram library. Please refresh the page and try again.';
}

/**
 * Create a diagram error display element
 * @param {DiagramRenderError} error - The diagram error
 * @param {string} language - The diagram language
 * @param {string} code - The diagram code (optional, for debugging)
 * @returns {HTMLElement} - Error display element
 */
export function createErrorElement(error, language, code = null) {
  const container = document.createElement('div');
  container.className = 'diagram-container diagram-error';
  container.setAttribute('data-error-type', error.type);

  // Error title
  const title = document.createElement('p');
  title.className = 'diagram-error-title';
  title.textContent = `${language.charAt(0).toUpperCase() + language.slice(1)} Diagram Error`;
  container.appendChild(title);

  // User-friendly message
  const userMessage = document.createElement('p');
  userMessage.className = 'diagram-error-message';
  userMessage.textContent = error.getUserMessage();
  container.appendChild(userMessage);

  // Technical details (collapsible)
  if (error.originalError || code) {
    const details = document.createElement('details');
    details.className = 'diagram-error-details';

    const summary = document.createElement('summary');
    summary.textContent = 'Technical details';
    details.appendChild(summary);

    if (error.originalError) {
      const debugInfo = document.createElement('pre');
      debugInfo.className = 'diagram-error-debug';
      debugInfo.textContent = error.getDebugMessage();
      details.appendChild(debugInfo);
    }

    if (code) {
      const codeSection = document.createElement('div');
      codeSection.className = 'diagram-error-code';

      const codeLabel = document.createElement('p');
      codeLabel.textContent = 'Diagram code:';
      codeLabel.className = 'diagram-error-code-label';
      codeSection.appendChild(codeLabel);

      const codeElement = document.createElement('pre');
      codeElement.className = 'diagram-error-code-content';
      codeElement.textContent = code;
      codeSection.appendChild(codeElement);

      details.appendChild(codeSection);
    }

    container.appendChild(details);
  }

  return container;
}

/**
 * Log diagram errors for debugging
 * @param {DiagramRenderError} error - The diagram error
 * @param {string} language - The diagram language
 * @param {string} code - The diagram code
 */
export function logDiagramError(error, language, code) {
  console.group(`❌ Diagram Rendering Error: ${language.toUpperCase()}`);

  console.error('User Message:', error.getUserMessage());
  console.error('Error Type:', error.type);
  console.error('Error Message:', error.message);

  if (error.originalError) {
    console.error('Original Error:', error.originalError);
  }

  if (code) {
    console.groupCollapsed('Diagram Code');
    console.log(code);
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Create a loading placeholder element
 * @param {string} language - The diagram language
 * @param {string} diagramId - Unique diagram ID
 * @returns {HTMLElement} - Loading placeholder element
 */
export function createLoadingPlaceholder(language, diagramId) {
  const container = document.createElement('div');
  container.className = 'diagram-container diagram-loading';
  container.id = diagramId;
  container.setAttribute('data-language', language);

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = 'diagram-loading-spinner';
  container.appendChild(spinner);

  // Loading text
  const loadingText = document.createElement('p');
  loadingText.className = 'diagram-loading-text';
  loadingText.textContent = `Rendering ${language} diagram...`;
  container.appendChild(loadingText);

  return container;
}

/**
 * Update loading placeholder with progress
 * @param {HTMLElement} placeholder - The loading placeholder element
 * @param {string} message - Progress message
 */
export function updateLoadingProgress(placeholder, message) {
  const loadingText = placeholder.querySelector('.diagram-loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
}
