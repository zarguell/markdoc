/**
 * DiagramManager - Orchestrates diagram rendering across multiple diagram types
 * Manages renderer registry and routes diagram blocks to appropriate renderers
 * Implements lazy loading for renderers to reduce initial bundle size
 */

export class DiagramManager {
  constructor() {
    // Map of language (lowercase) -> renderer instance
    this.renderers = new Map();
    // Map of language -> in-flight load promises
    this.rendererLoaders = new Map();
    // Map of language -> loading callbacks
    this.loadingCallbacks = new Map();
  }

  /**
   * Get the dynamic import loader for a specific language
   * @param {string} language - The diagram language
   * @returns {Function|undefined} - The loader function or undefined if not supported
   * @private
   */
  getRendererLoader(language) {
    const loaders = {
      'mermaid': () => import('./renderers/mermaidRenderer.js'),
      'dot': () => import('./renderers/vizRenderer.js'),
      'graphviz': () => import('./renderers/vizRenderer.js'),
      'nomnoml': () => import('./renderers/nomnomlRenderer.js'),
      'pikchr': () => import('./renderers/pikchrRenderer.js')
    };
    return loaders[language.toLowerCase()];
  }

  /**
   * Lazy load a renderer for a specific language
   * @param {string} language - The diagram language to load
   * @returns {Promise<DiagramRenderer>} - The loaded renderer instance
   * @throws {Error} If no loader is found for the language
   */
  async loadRenderer(language) {
    const langLower = language.toLowerCase();

    // Return cached renderer
    if (this.renderers.has(langLower)) {
      return this.renderers.get(langLower);
    }

    // Return in-flight load
    if (this.rendererLoaders.has(langLower)) {
      return this.rendererLoaders.get(langLower);
    }

    // Create new loading promise
    const loader = this.getRendererLoader(langLower);
    if (!loader) {
      throw new Error(`No loader found for language: ${language}`);
    }

    const loadPromise = loader()
      .then(module => {
        // Get the first exported class (the Renderer)
        const RendererClass = module[Object.keys(module)[0]];
        const renderer = new RendererClass();
        this.renderers.set(langLower, renderer);
        this.rendererLoaders.delete(langLower);
        this._notifyLoadingComplete(langLower);
        return renderer;
      })
      .catch(error => {
        this.rendererLoaders.delete(langLower);
        this._notifyLoadingError(langLower, error);
        throw error;
      });

    this.rendererLoaders.set(langLower, loadPromise);
    return loadPromise;
  }

  /**
   * Render a diagram using the appropriate renderer (lazy loads if needed)
   * @param {string} language - The diagram language (case-insensitive)
   * @param {string} code - The diagram code to render
   * @returns {Promise<SVGSVGElement>} - The rendered SVG element
   * @throws {Error} If no loader is found for the language
   */
  async renderDiagram(language, code) {
    const renderer = await this.loadRenderer(language);

    if (!renderer.initialized) {
      await renderer.initialize();
    }

    return await renderer.render(code);
  }

  /**
   * Register callbacks for loading state changes
   * @param {string} language - The diagram language
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onComplete - Called when loading completes
   * @param {Function} callbacks.onError - Called when loading fails
   */
  registerLoadingCallbacks(language, callbacks) {
    this.loadingCallbacks.set(language.toLowerCase(), callbacks);
  }

  /**
   * Notify that loading completed
   * @param {string} language - The diagram language
   * @private
   */
  _notifyLoadingComplete(language) {
    const callbacks = this.loadingCallbacks.get(language);
    if (callbacks?.onComplete) {
      callbacks.onComplete();
    }
  }

  /**
   * Notify that loading failed
   * @param {string} language - The diagram language
   * @param {Error} error - The error that occurred
   * @private
   */
  _notifyLoadingError(language, error) {
    const callbacks = this.loadingCallbacks.get(language);
    if (callbacks?.onError) {
      callbacks.onError(error);
    }
  }

  /**
   * Check if a diagram language is supported
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {boolean} - True if the language has a loader available
   */
  supportsLanguage(language) {
    if (!language) {
      return false;
    }

    const langLower = language.toLowerCase();
    return ['mermaid', 'dot', 'graphviz', 'nomnoml', 'pikchr'].includes(langLower);
  }

  /**
   * Get list of supported languages
   * @returns {string[]} - Array of supported language identifiers
   */
  getSupportedLanguages() {
    return ['mermaid', 'dot', 'graphviz', 'nomnoml', 'pikchr'];
  }

  /**
   * Register a renderer for a specific diagram language (for manual registration)
   * @param {string} language - The language identifier (case-insensitive)
   * @param {DiagramRenderer} renderer - The renderer instance
   */
  register(language, renderer) {
    if (!renderer) {
      throw new Error(`Cannot register null/undefined renderer for language: ${language}`);
    }

    if (typeof renderer.render !== 'function') {
      throw new Error(`Renderer must implement render() method for language: ${language}`);
    }

    this.renderers.set(language.toLowerCase(), renderer);
  }

  /**
   * Remove a renderer registration
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {boolean} - True if a renderer was removed
   */
  unregister(language) {
    return this.renderers.delete(language.toLowerCase());
  }

  /**
   * Clear all renderer registrations
   */
  clearRenderers() {
    this.renderers.clear();
  }

  /**
   * Get the renderer instance for a language (if already loaded)
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {DiagramRenderer|undefined} - The renderer instance or undefined
   */
  getRenderer(language) {
    return this.renderers.get(language.toLowerCase());
  }
}
