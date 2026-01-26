/**
 * PikchrRenderer - Renders Pikchr technical diagrams
 * PIC-like diagram language for technical illustrations
 *
 * TODO: Pikchr CDN URL is broken - library not available on unpkg/jsdelivr
 * Need to find alternative CDN or bundle the library locally
 * Current status: Pikchr diagrams fail to load
 * See: https://github.com/abetlen/pikchr-js
 */
import { DiagramRenderer } from './diagramRenderer.js';
import { ScriptLoader } from '../utils/scriptLoader.js';

export class PikchrRenderer extends DiagramRenderer {
  constructor() {
    super();
    this.loader = new ScriptLoader();
  }

  /**
   * Initialize the Pikchr library
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const loader = new ScriptLoader();

      // Try multiple possible URLs for pikchr-js
      const urls = [
        'https://cdn.jsdelivr.net/npm/pikchr@latest/pikchr.js',
        'https://unpkg.com/pikchr@latest/pikchr.js',
        'https://cdn.jsdelivr.net/npm/@abetlen/pikchr-js@latest/dist/pikchr.js',
        'https://unpkg.com/@abetlen/pikchr-js@latest/dist/pikchr.js'
      ];

      let loaded = false;
      for (const url of urls) {
        try {
          await loader.load(url);
          loaded = true;
          console.log(`Pikchr loaded from: ${url}`);
          break;
        } catch (e) {
          console.log(`Failed to load Pikchr from ${url}, trying next...`);
          continue;
        }
      }

      if (!loaded) {
        throw new Error('Could not load Pikchr from any CDN URL');
      }

      // pikchr is now available globally
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
