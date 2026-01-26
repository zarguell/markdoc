/**
 * PikchrRenderer - Renders Pikchr technical diagrams
 * PIC-like diagram language for technical illustrations
 */
import { DiagramRenderer } from './diagramRenderer.js';
import pikchr from 'pikchr-js';

export class PikchrRenderer extends DiagramRenderer {
  constructor() {
    super();
  }

  /**
   * Initialize the Pikchr library
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // pikchr is imported and ready to use
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Pikchr: ${error.message}`);
    }
  }

  /**
   * Render Pikchr diagram code to SVG
   * @param {string} code - Pikchr diagram code
   * @returns {Promise<SVGSVGElement>} - Rendered SVG element
   */
  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Render diagram - returns object with svg, width, height, error
      const result = pikchr(code);

      if (result.error) {
        throw new Error(result.error);
      }

      // Convert SVG string to element
      const svgElement = this.svgStringToElement(result.svg);

      // Set dimensions from result
      svgElement.setAttribute('width', result.width);
      svgElement.setAttribute('height', result.height);

      // Ensure inline styles for html2canvas compatibility
      return this.ensureInlineStyles(svgElement);
    } catch (error) {
      throw new Error(`Pikchr rendering failed: ${error.message}`);
    }
  }
}
