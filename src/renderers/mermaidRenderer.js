/**
 * MermaidRenderer - Renders Mermaid.js diagrams
 * Supports flowcharts, sequence diagrams, Gantt charts, and more
 */
import { DiagramRenderer } from './diagramRenderer.js';
import mermaid from 'mermaid';

export class MermaidRenderer extends DiagramRenderer {
  constructor() {
    super();
    this.mermaid = null;
  }

  /**
   * Initialize the Mermaid library
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      this.mermaid = mermaid;
      this.mermaid.initialize({
        startOnLoad: false,
        theme: 'default'
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Mermaid: ${error.message}`);
    }
  }

  /**
   * Render Mermaid diagram code to SVG
   * @param {string} code - Mermaid diagram code
   * @returns {Promise<SVGSVGElement>} - Rendered SVG element
   */
  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Generate unique ID for this render
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Render diagram
      const { svg } = await this.mermaid.render(id, code);

      // Convert SVG string to element
      const svgElement = this.svgStringToElement(svg);

      // Ensure inline styles for html2canvas compatibility
      return this.ensureInlineStyles(svgElement);
    } catch (error) {
      throw new Error(`Mermaid rendering failed: ${error.message}`);
    }
  }
}
