/**
 * Tests for html2canvas integration with diagrams
 * Tests that SVG diagrams render correctly in PDF output
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiagramManager } from '../src/DiagramManager.js';
import { renderMarkdownWithDiagrams } from '../src/utils/markdownDiagramProcessor.js';
import { prepareDiagramsForCanvas } from '../src/utils/canvasPreparer.js';

// Mock renderer class
class MockRenderer {
  constructor(name) {
    this.name = name;
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
  }

  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 50');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '50');

    // Add some content with inline styles
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '25');
    circle.setAttribute('r', '10');
    circle.style.fill = 'blue';
    circle.style.stroke = 'black';

    svg.appendChild(circle);

    return svg;
  }
}

describe('html2canvas Integration with Diagrams', () => {
  let diagramManager;

  beforeEach(() => {
    // Create a diagram manager with mock renderers
    diagramManager = new DiagramManager();
    diagramManager.clearRenderers();

    // Register mock renderers
    diagramManager.register('mermaid', new MockRenderer('mermaid'));
    diagramManager.register('dot', new MockRenderer('dot'));
    diagramManager.register('graphviz', new MockRenderer('graphviz'));
    diagramManager.register('nomnoml', new MockRenderer('nomnoml'));
    diagramManager.register('pikchr', new MockRenderer('pikchr'));
  });

  describe('SVG inline styles', () => {
    it('should apply inline styles to SVG elements for html2canvas', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Create a container and render the HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      try {
        // Prepare diagrams for canvas
        prepareDiagramsForCanvas(container);

        // Check that SVG elements have inline styles
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();

        const circle = svg.querySelector('circle');
        expect(circle).toBeTruthy();

        // Check that styles are inline (not just in CSS)
        expect(circle.getAttribute('style') || circle.style.fill).toBeTruthy();
      } finally {
        document.body.removeChild(container);
      }
    });

    it('should copy computed styles to inline styles', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Create a container with custom CSS
      const container = document.createElement('div');
      container.innerHTML = html;

      // Add a style element
      const style = document.createElement('style');
      style.textContent = `
        circle {
          fill: red;
          stroke: blue;
          stroke-width: 2px;
        }
      `;
      container.prepend(style);

      document.body.appendChild(container);

      try {
        // Prepare diagrams for canvas
        prepareDiagramsForCanvas(container);

        // Check that computed styles are now inline
        const circle = container.querySelector('circle');
        expect(circle).toBeTruthy();

        // After preparation, styles should be inline
        const inlineStyle = circle.getAttribute('style');
        expect(inlineStyle).toBeTruthy();
        expect(inlineStyle).toContain('fill');
      } finally {
        document.body.removeChild(container);
      }
    });
  });

  describe('DOM preparation', () => {
    it('should insert diagrams into DOM before canvas capture', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Create container
      const container = document.createElement('div');
      container.innerHTML = html;

      // SVG should be in the HTML string
      expect(html).toContain('<svg');

      // When added to DOM, SVG should be present
      document.body.appendChild(container);

      try {
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.parentElement).toBeTruthy();
      } finally {
        document.body.removeChild(container);
      }
    });

    it('should handle multiple diagrams in DOM', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`nomnoml
[A]->[B]
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      try {
        prepareDiagramsForCanvas(container);

        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(2);
      } finally {
        document.body.removeChild(container);
      }
    });
  });

  describe('SVG attributes', () => {
    it('should ensure SVG elements have required attributes', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      try {
        prepareDiagramsForCanvas(container);

        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();

        // Should have viewBox for proper scaling
        const viewBox = svg.getAttribute('viewBox');
        expect(viewBox).toBeTruthy();

        // Should have width and height
        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');
        expect(width || svg.style.width).toBeTruthy();
        expect(height || svg.style.height).toBeTruthy();
      } finally {
        document.body.removeChild(container);
      }
    });
  });

  describe('async rendering', () => {
    it('should wait for all diagrams to render', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`dot
digraph G { A -> B; }
\`\`\`
`;

      // Render markdown
      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Add to DOM
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      try {
        // Prepare diagrams (should handle async rendering)
        await prepareDiagramsForCanvas(container);

        // Check that all diagrams are present
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(2);

        // Each SVG should have content
        svgs.forEach(svg => {
          expect(svg.children.length).toBeGreaterThan(0);
        });
      } finally {
        document.body.removeChild(container);
      }
    });

    it('should handle rendering timeout', async () => {
      // Create a slow renderer
      class SlowRenderer extends MockRenderer {
        async render(code) {
          await new Promise(resolve => setTimeout(resolve, 100));
          return super.render(code);
        }
      }

      diagramManager.register('mermaid', new SlowRenderer('mermaid'));

      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const startTime = Date.now();
      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);
      const renderTime = Date.now() - startTime;

      // Should have taken at least 100ms
      expect(renderTime).toBeGreaterThanOrEqual(100);

      // But should still complete
      expect(html).toContain('<svg');
    });
  });

  describe('error handling for canvas capture', () => {
    it('should handle missing SVG gracefully', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p>No diagrams here</p>';
      document.body.appendChild(container);

      try {
        // Should not throw
        expect(() => {
          prepareDiagramsForCanvas(container);
        }).not.toThrow();
      } finally {
        document.body.removeChild(container);
      }
    });

    it('should handle malformed SVG', () => {
      const container = document.createElement('div');
      container.innerHTML = '<svg><invalid-element></svg>';
      document.body.appendChild(container);

      try {
        // Should not throw
        expect(() => {
          prepareDiagramsForCanvas(container);
        }).not.toThrow();
      } finally {
        document.body.removeChild(container);
      }
    });
  });

  describe('diagram containers', () => {
    it('should preserve diagram container structure', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      try {
        prepareDiagramsForCanvas(container);

        // Should still have the diagram-container div
        const diagramContainer = container.querySelector('.diagram-container');
        expect(diagramContainer).toBeTruthy();

        // SVG should be inside the container
        const svg = diagramContainer.querySelector('svg');
        expect(svg).toBeTruthy();
      } finally {
        document.body.removeChild(container);
      }
    });
  });
});
