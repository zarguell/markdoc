/**
 * NomnomlRenderer - Renders Nomnoml UML diagrams
 * Supports UML class diagrams, sequence diagrams, and more
 */
import { DiagramRenderer } from './diagramRenderer.js';
import { ScriptLoader } from '../utils/scriptLoader.js';

export class NomnomlRenderer extends DiagramRenderer {
  constructor() {
    super();
    this.loader = new ScriptLoader();
  }

  /**
   * Initialize the Nomnoml library
   * Must load graphre dependency first
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load dependency first
      await this.loader.load('https://unpkg.com/graphre/dist/graphre.js');
      // Then load nomnoml
      await this.loader.load('https://unpkg.com/nomnoml/dist/nomnoml.js');

      // nomnoml is now available globally
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Nomnoml: ${error.message}`);
    }
  }

  /**
   * Render Nomnoml diagram code to SVG
   * @param {string} code - Nomnoml diagram code
   * @returns {Promise<SVGSVGElement>} - Rendered SVG element
   */
  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Render diagram - returns SVG string
      const svgString = nomnoml.renderSvg(code);

      // Convert SVG string to element
      const svgElement = this.svgStringToElement(svgString);

      // Ensure inline styles for html2canvas compatibility
      return this.ensureInlineStyles(svgElement);
    } catch (error) {
      throw new Error(`Nomnoml rendering failed: ${error.message}`);
    }
  }
}
