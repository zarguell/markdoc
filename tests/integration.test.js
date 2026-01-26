/**
 * Integration tests for markdown-to-HTML with diagrams
 * Tests the complete pipeline from markdown with diagrams to HTML with rendered SVGs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DiagramManager } from '../src/DiagramManager.js';
import { renderMarkdownWithDiagrams } from '../src/utils/markdownDiagramProcessor.js';

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
    svg.setAttribute('data-language', this.name);
    svg.setAttribute('data-code', code);
    svg.innerHTML = `<g>Mock ${this.name} Diagram</g>`;
    return svg;
  }
}

describe('Markdown to HTML with Diagrams - Integration Tests', () => {
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

  describe('single diagram type', () => {
    it('should render mermaid diagram in HTML', async () => {
      const markdown = `# Test Document

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain SVG element
      expect(html).toContain('<svg');
      expect(html).toContain('data-language="mermaid"');
      // Should NOT contain the original code block
      expect(html).not.toContain('```mermaid');
      // Note: the code may be HTML-escaped in the data attribute
    });

    it('should render dot diagram in HTML', async () => {
      const markdown = `# Graphviz Diagram

\`\`\`dot
digraph G {
  A -> B;
}
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      expect(html).toContain('<svg');
      expect(html).toContain('data-language="dot"');
      expect(html).not.toContain('```dot');
    });

    it('should render nomnoml diagram in HTML', async () => {
      const markdown = `# UML Diagram

\`\`\`nomnoml
[A]->[B]
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      expect(html).toContain('<svg');
      expect(html).toContain('data-language="nomnoml"');
      expect(html).not.toContain('```nomnoml');
    });

    it('should render pikchr diagram in HTML', async () => {
      const markdown = `# Technical Diagram

\`\`\`pikchr
box "A"; arrow; box "B"
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      expect(html).toContain('<svg');
      expect(html).toContain('data-language="pikchr"');
      expect(html).not.toContain('```pikchr');
    });
  });

  describe('multiple diagram types in same document', () => {
    it('should render different diagram types', async () => {
      const markdown = `# Mixed Diagrams

\`\`\`mermaid
graph TD
A-->B
\`\`\`

Some text between diagrams.

\`\`\`nomnoml
[A]->[B]
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain 2 SVG elements
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(2);

      // Should not contain any code blocks
      expect(html).not.toContain('```mermaid');
      expect(html).not.toContain('```nomnoml');
    });

    it('should handle all four diagram types in one document', async () => {
      const markdown = `# All Diagram Types

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`dot
digraph G { A -> B; }
\`\`\`

\`\`\`nomnoml
[A]->[B]
\`\`\`

\`\`\`pikchr
box "A"; arrow; box "B"
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain 4 SVG elements
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(4);
    });

    it('should handle multiple diagrams of same type', async () => {
      const markdown = `# Multiple Mermaid Diagrams

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`mermaid
graph LR
C-->D
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain 2 SVG elements
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(2);
    });
  });

  describe('diagram order and position preservation', () => {
    it('should preserve diagram order', async () => {
      const markdown = `# Diagram Order

First:

\`\`\`mermaid
graph TD
A-->B
\`\`\`

Second:

\`\`\`nomnoml
[A]->[B]
\`\`\`

Third:

\`\`\`dot
digraph G { A -> B; }
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Find positions of SVG elements
      const matches = [...html.matchAll(/data-language=/g)];
      expect(matches.length).toBe(3);

      // Check order of languages
      expect(html.indexOf('mermaid')).toBeLessThan(html.indexOf('nomnoml'));
      expect(html.indexOf('nomnoml')).toBeLessThan(html.indexOf('dot'));
    });

    it('should preserve surrounding content', async () => {
      const markdown = `# Title

Some introductory text.

\`\`\`mermaid
graph TD
A-->B
\`\`\`

Some concluding text.
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain the text content
      expect(html).toContain('introductory');
      expect(html).toContain('concluding');

      // Should contain the diagram
      expect(html).toContain('<svg');

      // Text should be in order
      const introIndex = html.indexOf('introductory');
      const svgIndex = html.indexOf('<svg');
      const conclIndex = html.indexOf('concluding');

      expect(introIndex).toBeLessThan(svgIndex);
      expect(svgIndex).toBeLessThan(conclIndex);
    });
  });

  describe('non-diagram code blocks', () => {
    it('should leave non-diagram code blocks unchanged', async () => {
      const markdown = `# Code Examples

JavaScript code:

\`\`\`javascript
function hello() {
  console.log('Hello');
}
\`\`\`

Python code:

\`\`\`python
def hello():
  print('Hello')
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should NOT contain SVG (no diagram languages)
      expect(html).not.toContain('<svg');

      // Should contain the code blocks unchanged
      expect(html).toContain('```javascript');
      expect(html).toContain('```python');

      // Should contain the code content
      expect(html).toContain('function hello()');
      expect(html).toContain('def hello()');
    });

    it('should handle mixed diagram and non-diagram blocks', async () => {
      const markdown = `# Mixed Content

Code:

\`\`\`javascript
const x = 42;
\`\`\`

Diagram:

\`\`\`mermaid
graph TD
A-->B
\`\`\`

More code:

\`\`\`python
x = 42
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain one SVG
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(1);

      // Should contain non-diagram code blocks unchanged
      expect(html).toContain('```javascript');
      expect(html).toContain('```python');

      // Should contain the code content
      expect(html).toContain('const x = 42');
      expect(html).toContain('x = 42');

      // Should NOT contain the diagram code block
      expect(html).not.toContain('```mermaid');
    });
  });

  describe('document structure', () => {
    it('should handle documents with no diagrams', async () => {
      const markdown = `# Just Text

This is a regular markdown document with no diagrams.

\`\`\`javascript
const x = 42;
\`\`\`

Just text and code.
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should not contain any SVGs
      expect(html).not.toContain('<svg');

      // Should contain the content unchanged
      expect(html).toContain('Just Text');
      expect(html).toContain('regular markdown document');
      expect(html).toContain('```javascript');
    });

    it('should handle document with only diagrams', async () => {
      const markdown = `# Diagrams Only

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`nomnoml
[A]->[B]
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain 2 SVGs
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(2);

      // Should contain the title
      expect(html).toContain('Diagrams Only');
    });
  });

  describe('error handling', () => {
    it('should handle invalid diagram syntax gracefully', async () => {
      // Create a renderer that throws an error
      class ErrorRenderer extends MockRenderer {
        async render(code) {
          throw new Error('Invalid syntax');
        }
      }

      // Replace the mermaid renderer with an error renderer
      diagramManager.register('mermaid', new ErrorRenderer('mermaid'));

      const markdown = `# Invalid Diagram

\`\`\`mermaid
invalid code here
\`\`\`
`;

      // Should not throw, but should include error message
      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain error indication
      expect(html).toContain('diagram-error');
      expect(html).toContain('Invalid syntax');
    });

    it('should continue processing after error', async () => {
      // Create a renderer that throws an error
      class ErrorRenderer extends MockRenderer {
        async render(code) {
          throw new Error('Invalid syntax');
        }
      }

      // Replace the mermaid renderer with an error renderer
      diagramManager.register('mermaid', new ErrorRenderer('mermaid'));

      const markdown = `# Mixed Valid and Invalid

\`\`\`mermaid
invalid syntax here
\`\`\`

\`\`\`nomnoml
[A]->[B]
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain error for first diagram
      expect(html).toContain('diagram-error');

      // Should still render the second diagram
      const svgMatches = html.match(/<svg/g);
      expect(svgMatches).toBeTruthy();
      expect(svgMatches.length).toBe(1);
    });
  });

  describe('diagram containers', () => {
    it('should wrap diagrams in container divs', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should contain diagram-container class
      expect(html).toContain('diagram-container');
    });

    it('should add unique IDs to diagram containers', async () => {
      const markdown = `# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`mermaid
graph LR
C-->D
\`\`\`
`;

      const html = await renderMarkdownWithDiagrams(markdown, diagramManager);

      // Should find two diagram-container elements with different IDs
      const idMatches = [...html.matchAll(/id="diagram-[^"]+"/g)];
      expect(idMatches.length).toBe(2);

      // IDs should be unique
      const ids = idMatches.map(m => m[0]);
      expect(new Set(ids).size).toBe(2);
    });
  });
});
