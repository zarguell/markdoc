/**
 * NomnomlRenderer - Renders Nomnoml UML diagrams
 * Supports UML class diagrams, sequence diagrams, and more
 */
import { DiagramRenderer } from './diagramRenderer.js';
import nomnoml from 'nomnoml';

export class NomnomlRenderer extends DiagramRenderer {
  constructor() {
    super();
  }

  /**
   * Initialize the Nomnoml library
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // nomnoml is imported and ready to use
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
