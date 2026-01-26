/**
 * VizRenderer - Renders Graphviz DOT diagrams
 * Supports both directed and undirected graphs using Viz.js
 */
import { DiagramRenderer } from './diagramRenderer.js';
import { ScriptLoader } from '../utils/scriptLoader.js';

export class VizRenderer extends DiagramRenderer {
  constructor() {
    super();
    this.viz = null;
  }

  /**
   * Initialize the Viz.js library
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const loader = new ScriptLoader();
      await loader.load('https://cdn.jsdelivr.net/npm/@viz-js/viz@latest/lib/viz-standalone.js');

      // Viz is now available globally
      this.viz = await Viz.instance();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Viz: ${error.message}`);
    }
  }

  /**
   * Render Graphviz DOT code to SVG
   * @param {string} code - Graphviz DOT code
   * @returns {Promise<SVGSVGElement>} - Rendered SVG element
   */
  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Render diagram - returns SVGSVGElement directly
      const svgElement = await this.viz.renderSVGElement(code);

      // Ensure inline styles for html2canvas compatibility
      return this.ensureInlineStyles(svgElement);
    } catch (error) {
      throw new Error(`Graphviz rendering failed: ${error.message}`);
    }
  }
}
