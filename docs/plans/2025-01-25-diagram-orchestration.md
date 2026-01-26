# Phase 4: Diagram Orchestration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the orchestration layer that manages multiple diagram renderers and integrates them with the markdown-to-PDF conversion pipeline.

**Architecture:**
- Create a DiagramManager that routes diagram types to appropriate renderers
- Build a processing pipeline that converts markdown code blocks to rendered SVGs
- Integrate with existing PDF generation using html2canvas
- Follow TDD with unit tests for each component

**Tech Stack:**
- Vitest for testing
- Existing renderer classes (MermaidRenderer, VizRenderer, NomnomlRenderer, PikchrRenderer)
- Existing markdownParser utilities (extractCodeBlocks, isDiagramLanguage, getDiagramBlocks)
- DOM manipulation for replacing code blocks with SVGs

---

## Task 1: DiagramManager Class - Structure and Registration

**Files:**
- Create: `src/DiagramManager.js`
- Test: `tests/DiagramManager.test.js`

**Step 1: Write failing test for DiagramManager instantiation**

```javascript
// tests/DiagramManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { DiagramManager } from '../../src/DiagramManager.js';

describe('DiagramManager', () => {
  let manager;

  beforeEach(() => {
    manager = new DiagramManager();
  });

  it('should create instance with empty renderer registry', () => {
    expect(manager.renderers).toBeInstanceOf(Map);
    expect(manager.renderers.size).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: FAIL with "DiagramManager is not defined"

**Step 3: Write minimal implementation**

```javascript
// src/DiagramManager.js
/**
 * DiagramManager - Orchestrates multiple diagram renderers
 * Routes diagram types to appropriate renderers and manages their lifecycle
 */
export class DiagramManager {
  constructor() {
    this.renderers = new Map();
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/DiagramManager.test.js src/DiagramManager.js
git commit -m "feat: add DiagramManager class structure"
```

---

## Task 2: DiagramManager - Renderer Registration

**Files:**
- Modify: `src/DiagramManager.js`
- Modify: `tests/DiagramManager.test.js`

**Step 1: Write failing test for register method**

```javascript
// Add to tests/DiagramManager.test.js
import { DiagramManager } from '../../src/DiagramManager.js';

// Mock renderer class
class MockRenderer {
  constructor() {
    this.initialized = false;
  }
  async initialize() {
    this.initialized = true;
  }
  async render(code) {
    return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }
}

describe('DiagramManager', () => {
  // ... existing tests ...

  describe('register()', () => {
    it('should register renderer for language', () => {
      const renderer = new MockRenderer();
      manager.register('mermaid', renderer);

      expect(manager.renderers.get('mermaid')).toBe(renderer);
    });

    it('should handle case-insensitive language names', () => {
      const renderer = new MockRenderer();
      manager.register('Mermaid', renderer);

      expect(manager.renderers.get('mermaid')).toBe(renderer);
    });

    it('should allow overwriting existing renderer', () => {
      const renderer1 = new MockRenderer();
      const renderer2 = new MockRenderer();

      manager.register('mermaid', renderer1);
      manager.register('mermaid', renderer2);

      expect(manager.renderers.get('mermaid')).toBe(renderer2);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: FAIL with "manager.register is not a function"

**Step 3: Implement register method**

```javascript
// Add to DiagramManager class in src/DiagramManager.js

/**
 * Register a renderer for a specific diagram language
 * @param {string} language - The language identifier (e.g., 'mermaid', 'dot')
 * @param {DiagramRenderer} renderer - The renderer instance
 */
register(language, renderer) {
  const normalizedLanguage = language.toLowerCase();
  this.renderers.set(normalizedLanguage, renderer);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/DiagramManager.js tests/DiagramManager.test.js
git commit -m "feat: add renderer registration to DiagramManager"
```

---

## Task 3: DiagramManager - Default Renderer Registration

**Files:**
- Modify: `src/DiagramManager.js`
- Modify: `tests/DiagramManager.test.js`

**Step 1: Write failing test for default renderers**

```javascript
// Add to tests/DiagramManager.test.js
import { DiagramManager } from '../../src/DiagramManager.js';
import { MermaidRenderer } from '../../src/renderers/mermaidRenderer.js';
import { VizRenderer } from '../../src/renderers/vizRenderer.js';
import { NomnomlRenderer } from '../../src/renderers/nomnomlRenderer.js';
import { PikchrRenderer } from '../../src/renderers/pikchrRenderer.js';

describe('DiagramManager', () => {
  // ... existing tests ...

  describe('default renderers', () => {
    it('should register all default renderers on construction', () => {
      const manager = new DiagramManager();

      expect(manager.renderers.has('mermaid')).toBe(true);
      expect(manager.renderers.has('dot')).toBe(true);
      expect(manager.renderers.has('graphviz')).toBe(true);
      expect(manager.renderers.has('nomnoml')).toBe(true);
      expect(manager.renderers.has('pikchr')).toBe(true);
    });

    it('should use MermaidRenderer for mermaid language', () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('mermaid');

      expect(renderer).toBeInstanceOf(MermaidRenderer);
    });

    it('should use VizRenderer for dot and graphviz languages', () => {
      const manager = new DiagramManager();
      const dotRenderer = manager.renderers.get('dot');
      const graphvizRenderer = manager.renderers.get('graphviz');

      expect(dotRenderer).toBeInstanceOf(VizRenderer);
      expect(graphvizRenderer).toBeInstanceOf(VizRenderer);
      expect(dotRenderer).toBe(graphvizRenderer); // Same instance
    });

    it('should use NomnomlRenderer for nomnoml language', () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('nomnoml');

      expect(renderer).toBeInstanceOf(NomnomlRenderer);
    });

    it('should use PikchrRenderer for pikchr language', () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('pikchr');

      expect(renderer).toBeInstanceOf(PikchrRenderer);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: FAIL - renderers not registered by default

**Step 3: Implement registerDefaultRenderers method**

```javascript
// Add to top of src/DiagramManager.js
import { MermaidRenderer } from './renderers/mermaidRenderer.js';
import { VizRenderer } from './renderers/vizRenderer.js';
import { NomnomlRenderer } from './renderers/nomnomlRenderer.js';
import { PikchrRenderer } from './renderers/pikchrRenderer.js';

// Modify DiagramManager constructor
export class DiagramManager {
  constructor() {
    this.renderers = new Map();
    this.registerDefaultRenderers();
  }

  /**
   * Register all built-in diagram renderers
   * @private
   */
  registerDefaultRenderers() {
    const vizRenderer = new VizRenderer();

    this.register('mermaid', new MermaidRenderer());
    this.register('dot', vizRenderer);
    this.register('graphviz', vizRenderer); // Same instance for both
    this.register('nomnoml', new NomnomlRenderer());
    this.register('pikchr', new PikchrRenderer());
  }

  // ... rest of class ...
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/DiagramManager.js tests/DiagramManager.test.js
git commit -m "feat: add default renderer registration in DiagramManager"
```

---

## Task 4: DiagramManager - Render Method

**Files:**
- Modify: `src/DiagramManager.js`
- Modify: `tests/DiagramManager.test.js`

**Step 1: Write failing test for renderDiagram method**

```javascript
// Add to tests/DiagramManager.test.js
import { DiagramManager } from '../../src/DiagramManager.js';

describe('DiagramManager', () => {
  // ... existing tests ...

  describe('renderDiagram()', () => {
    beforeEach(() => {
      // Mock all renderers
      vi.mock('../../src/renderers/mermaidRenderer.js', () => ({
        MermaidRenderer: vi.fn().mockImplementation(() => ({
          initialized: false,
          initialize: vi.fn().mockResolvedValue(undefined),
          render: vi.fn().mockResolvedValue(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
        }))
      }));
    });

    it('should render diagram using appropriate renderer', async () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('mermaid');

      // Mock render method
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      renderer.render = vi.fn().mockResolvedValue(mockSvg);

      const result = await manager.renderDiagram('mermaid', 'graph TD\nA-->B');

      expect(renderer.render).toHaveBeenCalledWith('graph TD\nA-->B');
      expect(result).toBe(mockSvg);
    });

    it('should throw error for unsupported language', async () => {
      const manager = new DiagramManager();

      await expect(manager.renderDiagram('unknown', 'code'))
        .rejects.toThrow('No renderer registered for language: unknown');
    });

    it('should handle case-insensitive language names', async () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('mermaid');

      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      renderer.render = vi.fn().mockResolvedValue(mockSvg);

      const result = await manager.renderDiagram('MERMAID', 'graph TD\nA-->B');

      expect(result).toBe(mockSvg);
    });

    it('should propagate renderer errors', async () => {
      const manager = new DiagramManager();
      const renderer = manager.renderers.get('mermaid');

      renderer.render = vi.fn().mockRejectedValue(new Error('Syntax error'));

      await expect(manager.renderDiagram('mermaid', 'invalid code'))
        .rejects.toThrow('Syntax error');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: FAIL with "manager.renderDiagram is not a function"

**Step 3: Implement renderDiagram method**

```javascript
// Add to DiagramManager class in src/DiagramManager.js

/**
 * Render a diagram using the appropriate renderer
 * @param {string} language - The diagram language identifier
 * @param {string} code - The diagram code to render
 * @returns {Promise<SVGSVGElement>} - The rendered SVG element
 * @throws {Error} - If no renderer is registered for the language
 */
async renderDiagram(language, code) {
  const normalizedLanguage = language.toLowerCase();
  const renderer = this.renderers.get(normalizedLanguage);

  if (!renderer) {
    throw new Error(`No renderer registered for language: ${language}`);
  }

  return await renderer.render(code);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/DiagramManager.js tests/DiagramManager.test.js
git commit -m "feat: add renderDiagram method to DiagramManager"
```

---

## Task 5: DiagramManager - Support Query Method

**Files:**
- Modify: `src/DiagramManager.js`
- Modify: `tests/DiagramManager.test.js`

**Step 1: Write failing test for supportsLanguage method**

```javascript
// Add to tests/DiagramManager.test.js
describe('DiagramManager', () => {
  // ... existing tests ...

  describe('supportsLanguage()', () => {
    it('should return true for supported languages', () => {
      const manager = new DiagramManager();

      expect(manager.supportsLanguage('mermaid')).toBe(true);
      expect(manager.supportsLanguage('dot')).toBe(true);
      expect(manager.supportsLanguage('graphviz')).toBe(true);
      expect(manager.supportsLanguage('nomnoml')).toBe(true);
      expect(manager.supportsLanguage('pikchr')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      const manager = new DiagramManager();

      expect(manager.supportsLanguage('unknown')).toBe(false);
      expect(manager.supportsLanguage('javascript')).toBe(false);
      expect(manager.supportsLanguage('python')).toBe(false);
    });

    it('should handle case-insensitive language names', () => {
      const manager = new DiagramManager();

      expect(manager.supportsLanguage('MERMAID')).toBe(true);
      expect(manager.supportsLanguage('Dot')).toBe(true);
      expect(manager.supportsLanguage('GRAPHVIZ')).toBe(true);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: FAIL with "manager.supportsLanguage is not a function"

**Step 3: Implement supportsLanguage method**

```javascript
// Add to DiagramManager class in src/DiagramManager.js

/**
 * Check if a diagram language is supported
 * @param {string} language - The language identifier to check
 * @returns {boolean} - True if the language is supported
 */
supportsLanguage(language) {
  return this.renderers.has(language.toLowerCase());
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/DiagramManager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/DiagramManager.js tests/DiagramManager.test.js
git commit -m "feat: add supportsLanguage method to DiagramManager"
```

---

## Task 6: Markdown Processing Pipeline - Basic Structure

**Files:**
- Create: `src/markdownProcessor.js`
- Create: `tests/markdownProcessor.test.js`

**Step 1: Write failing test for MarkdownProcessor**

```javascript
// tests/markdownProcessor.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownProcessor } from '../../src/markdownProcessor.js';

describe('MarkdownProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new MarkdownProcessor();
  });

  it('should create instance with DiagramManager', () => {
    expect(processor.diagramManager).toBeDefined();
    expect(processor.diagramManager.renderers).toBeInstanceOf(Map);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: FAIL with "MarkdownProcessor is not defined"

**Step 3: Write minimal implementation**

```javascript
// src/markdownProcessor.js
/**
 * MarkdownProcessor - Processes markdown and renders diagrams
 * Converts markdown code blocks to rendered SVG diagrams
 */
import { DiagramManager } from './DiagramManager.js';

export class MarkdownProcessor {
  constructor() {
    this.diagramManager = new DiagramManager();
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/markdownProcessor.test.js src/markdownProcessor.js
git commit -m "feat: add MarkdownProcessor class structure"
```

---

## Task 7: MarkdownProcessor - Replace Code Blocks with Diagrams

**Files:**
- Modify: `src/markdownProcessor.js`
- Modify: `tests/markdownProcessor.test.js`

**Step 1: Write failing test for processing markdown**

```javascript
// Add to tests/markdownProcessor.test.js
import { MarkdownProcessor } from '../../src/markdownProcessor.js';

describe('MarkdownProcessor', () => {
  // ... existing tests ...

  describe('process()', () => {
    it('should replace mermaid code block with diagram placeholder', async () => {
      const markdown = `
# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
      `;

      const result = await processor.process(markdown);

      // Should replace code block with placeholder div
      expect(result).toContain('class="diagram-placeholder"');
      expect(result).toContain('data-language="mermaid"');
      expect(result).not.toContain('```mermaid');
    });

    it('should handle multiple diagram blocks', async () => {
      const markdown = `
\`\`\`mermaid
graph TD
A-->B
\`\`\`

\`\`\`nomnoml
[A]->[B]
\`\`\`
      `;

      const result = await processor.process(markdown);

      const placeholders = result.match(/class="diagram-placeholder"/g) || [];
      expect(placeholders.length).toBe(2);
    });

    it('should preserve non-diagram code blocks', async () => {
      const markdown = `
\`\`\`javascript
const x = 42;
\`\`\`

\`\`\`mermaid
graph TD
A-->B
\`\`\`
      `;

      const result = await processor.process(markdown);

      expect(result).toContain('```javascript');
      expect(result).toContain('const x = 42;');
      expect(result).not.toContain('```mermaid');
    });

    it('should preserve markdown order and position', async () => {
      const markdown = `# Title

Text before

\`\`\`mermaid
graph TD
A-->B
\`\`\`

Text after`;

      const result = await processor.process(markdown);

      // Check order: title, before text, diagram, after text
      const titleIndex = result.indexOf('# Title');
      const beforeIndex = result.indexOf('Text before');
      const diagramIndex = result.indexOf('diagram-placeholder');
      const afterIndex = result.indexOf('Text after');

      expect(titleIndex).toBeLessThan(beforeIndex);
      expect(beforeIndex).toBeLessThan(diagramIndex);
      expect(diagramIndex).toBeLessThan(afterIndex);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: FAIL with "processor.process is not a function"

**Step 3: Implement process method**

```javascript
// Add to src/markdownProcessor.js
import { DiagramManager } from './DiagramManager.js';
import { getDiagramBlocks } from './utils/markdownParser.js';

export class MarkdownProcessor {
  constructor() {
    this.diagramManager = new DiagramManager();
  }

  /**
   * Process markdown and replace diagram code blocks with placeholders
   * @param {string} markdown - The markdown text to process
   * @returns {Promise<string>} - Processed HTML with diagram placeholders
   */
  async process(markdown) {
    const diagramBlocks = getDiagramBlocks(markdown);
    let processedMarkdown = markdown;

    // Process blocks in reverse order to maintain correct indices
    for (let i = diagramBlocks.length - 1; i >= 0; i--) {
      const block = diagramBlocks[i];
      const placeholder = this.createPlaceholder(block);

      // Replace the code block with placeholder
      processedMarkdown =
        processedMarkdown.substring(0, block.startIndex) +
        placeholder +
        processedMarkdown.substring(block.endIndex);
    }

    return processedMarkdown;
  }

  /**
   * Create a placeholder element for a diagram block
   * @param {Object} block - The diagram block object
   * @returns {string} - HTML string for the placeholder
   * @private
   */
  createPlaceholder(block) {
    const id = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `<div class="diagram-placeholder" id="${id}" data-language="${block.language}" data-code="${this.escapeHtml(block.code)}"></div>`;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/markdownProcessor.js tests/markdownProcessor.test.js
git commit -m "feat: add markdown processing with diagram placeholder replacement"
```

---

## Task 8: MarkdownProcessor - Render Diagrams in DOM

**Files:**
- Modify: `src/markdownProcessor.js`
- Modify: `tests/markdownProcessor.test.js`

**Step 1: Write failing test for rendering diagrams to DOM**

```javascript
// Add to tests/markdownProcessor.test.js
import { MarkdownProcessor } from '../../src/markdownProcessor.js';

describe('MarkdownProcessor', () => {
  // ... existing tests ...

  describe('renderDiagramsToDom()', () => {
    beforeEach(() => {
      // Create DOM container for testing
      document.body.innerHTML = '';
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
    });

    it('should render diagram into placeholder element', async () => {
      const container = document.getElementById('test-container');

      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'diagram-placeholder';
      placeholder.dataset.language = 'mermaid';
      placeholder.dataset.code = 'graph TD\nA-->B';
      container.appendChild(placeholder);

      // Mock the diagram manager render
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '100');
      mockSvg.setAttribute('height', '100');

      processor.diagramManager.renderDiagram = vi.fn().mockResolvedValue(mockSvg);

      await processor.renderDiagramsToDom(container);

      expect(placeholder.querySelector('svg')).toBeTruthy();
      expect(placeholder.classList.contains('diagram-placeholder')).toBe(false);
      expect(placeholder.classList.contains('diagram-container')).toBe(true);
    });

    it('should handle multiple diagram placeholders', async () => {
      const container = document.getElementById('test-container');

      // Create multiple placeholders
      for (let i = 0; i < 3; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'diagram-placeholder';
        placeholder.dataset.language = 'mermaid';
        placeholder.dataset.code = `graph TD\nA${i}-->B${i}`;
        container.appendChild(placeholder);
      }

      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      processor.diagramManager.renderDiagram = vi.fn().mockResolvedValue(mockSvg);

      await processor.renderDiagramsToDom(container);

      const diagrams = container.querySelectorAll('.diagram-container svg');
      expect(diagrams.length).toBe(3);
    });

    it('should handle rendering errors gracefully', async () => {
      const container = document.getElementById('test-container');

      const placeholder = document.createElement('div');
      placeholder.className = 'diagram-placeholder';
      placeholder.dataset.language = 'mermaid';
      placeholder.dataset.code = 'invalid syntax';
      container.appendChild(placeholder);

      processor.diagramManager.renderDiagram = vi.fn()
        .mockRejectedValue(new Error('Parse error'));

      await processor.renderDiagramsToDom(container);

      // Should show error message instead of crashing
      expect(placeholder.querySelector('.diagram-error')).toBeTruthy();
      expect(placeholder.textContent).toContain('Error rendering mermaid');
    });

    it('should ignore non-placeholder elements', async () => {
      const container = document.getElementById('test-container');

      const regularDiv = document.createElement('div');
      regularDiv.className = 'regular-div';
      regularDiv.textContent = 'Regular content';
      container.appendChild(regularDiv);

      const placeholder = document.createElement('div');
      placeholder.className = 'diagram-placeholder';
      placeholder.dataset.language = 'mermaid';
      placeholder.dataset.code = 'graph TD\nA-->B';
      container.appendChild(placeholder);

      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      processor.diagramManager.renderDiagram = vi.fn().mockResolvedValue(mockSvg);

      await processor.renderDiagramsToDom(container);

      expect(regularDiv.textContent).toBe('Regular content');
      expect(placeholder.querySelector('svg')).toBeTruthy();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: FAIL with "processor.renderDiagramsToDom is not a function"

**Step 3: Implement renderDiagramsToDom method**

```javascript
// Add to MarkdownProcessor class in src/markdownProcessor.js

/**
 * Render diagrams into placeholder elements in the DOM
 * @param {HTMLElement} container - The DOM container containing placeholders
 * @returns {Promise<void>}
 */
async renderDiagramsToDom(container) {
  const placeholders = container.querySelectorAll('.diagram-placeholder');

  for (const placeholder of placeholders) {
    const language = placeholder.dataset.language;
    const code = placeholder.dataset.code;

    if (!language || !code) continue;

    try {
      // Render the diagram
      const svgElement = await this.diagramManager.renderDiagram(language, code);

      // Clear placeholder and add rendered diagram
      placeholder.innerHTML = '';
      placeholder.appendChild(svgElement);

      // Update class to indicate it's now rendered
      placeholder.classList.remove('diagram-placeholder');
      placeholder.classList.add('diagram-container');

    } catch (error) {
      // Handle rendering errors
      placeholder.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'diagram-error';
      errorDiv.textContent = `Error rendering ${language}: ${error.message}`;
      placeholder.appendChild(errorDiv);

      console.error(`Failed to render ${language} diagram:`, error);
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/markdownProcessor.js tests/markdownProcessor.test.js
git commit -m "feat: add diagram rendering to DOM in MarkdownProcessor"
```

---

## Task 9: Integration Test - End-to-End Processing

**Files:**
- Create: `tests/integration/diagramProcessing.test.js`

**Step 1: Write failing integration test**

```javascript
// tests/integration/diagramProcessing.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownProcessor } from '../../src/markdownProcessor.js';

describe('Diagram Processing Integration', () => {
  let processor;

  beforeEach(() => {
    processor = new MarkdownProcessor();

    // Setup DOM
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  it('should process markdown with diagrams and render to DOM', async () => {
    const markdown = `
# Document Title

Here is a flowchart:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E
\`\`\`

And here is a UML diagram:

\`\`\`nomnoml
[User]->[Login]
[Login]->[Database]
\`\`\`

End of document.
    `;

    // Mock the diagram renderers
    const mockMermaidSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockMermaidSvg.setAttribute('width', '200');
    mockMermaidSvg.setAttribute('height', '150');

    const mockNomnomlSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockNomnomlSvg.setAttribute('width', '100');
    mockNomnomlSvg.setAttribute('height', '100');

    processor.diagramManager.renderDiagram = vi.fn()
      .mockImplementation((lang, code) => {
        if (lang === 'mermaid') return Promise.resolve(mockMermaidSvg);
        if (lang === 'nomnoml') return Promise.resolve(mockNomnomlSvg);
        return Promise.reject(new Error('Unknown language'));
      });

    // Process markdown
    const processedHtml = await processor.process(markdown);

    // Create DOM from processed HTML
    const container = document.getElementById('test-container');
    container.innerHTML = processedHtml;

    // Render diagrams
    await processor.renderDiagramsToDom(container);

    // Verify results
    expect(container.innerHTML).toContain('Document Title');
    expect(container.innerHTML).toContain('Here is a flowchart');

    const diagrams = container.querySelectorAll('.diagram-container svg');
    expect(diagrams.length).toBe(2);
    expect(processor.diagramManager.renderDiagram).toHaveBeenCalledTimes(2);
  });

  it('should handle mixed diagram and code blocks', async () => {
    const markdown = `
\`\`\`javascript
const x = 42;
console.log(x);
\`\`\`

\`\`\`mermaid
graph LR
A-->B
\`\`\`

\`\`\`python
print("hello")
\`\`\`
    `;

    processor.diagramManager.renderDiagram = vi.fn()
      .mockResolvedValue(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));

    const processedHtml = await processor.process(markdown);

    // Non-diagram code blocks should remain
    expect(processedHtml).toContain('```javascript');
    expect(processedHtml).toContain('```python');

    // Diagram code block should be replaced
    expect(processedHtml).not.toContain('```mermaid');
    expect(processedHtml).toContain('diagram-placeholder');
  });

  it('should preserve diagram order in document', async () => {
    const markdown = `
\`\`\`mermaid
graph TD
A-->B
\`\`\`

Text between

\`\`\`dot
digraph G {
  A -> B;
}
\`\`\`

More text

\`\`\`nomnoml
[A]->[B]
\`\`\`
    `;

    const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    processor.diagramManager.renderDiagram = vi.fn().mockResolvedValue(mockSvg);

    const processedHtml = await processor.process(markdown);

    const container = document.getElementById('test-container');
    container.innerHTML = processedHtml;
    await processor.renderDiagramsToDom(container);

    const diagrams = container.querySelectorAll('.diagram-container');

    // Check order by finding text between them
    const html = container.innerHTML;
    const firstDiagramIndex = html.indexOf(diagrams[0].outerHTML);
    const betweenTextIndex = html.indexOf('Text between');
    const secondDiagramIndex = html.indexOf(diagrams[1].outerHTML);
    const moreTextIndex = html.indexOf('More text');
    const thirdDiagramIndex = html.indexOf(diagrams[2].outerHTML);

    expect(firstDiagramIndex).toBeLessThan(betweenTextIndex);
    expect(betweenTextIndex).toBeLessThan(secondDiagramIndex);
    expect(secondDiagramIndex).toBeLessThan(moreTextIndex);
    expect(moreTextIndex).toBeLessThan(thirdDiagramIndex);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/diagramProcessing.test.js`
Expected: FAIL - Various failures as integration isn't complete

**Step 3: Ensure all previous tasks are complete**

Run: `npm test`
Expected: All existing tests pass

**Step 4: Run integration test**

Run: `npm test -- tests/integration/diagramProcessing.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/integration/diagramProcessing.test.js
git commit -m "test: add end-to-end diagram processing integration tests"
```

---

## Task 10: html2canvas Integration - Preparation

**Files:**
- Modify: `src/markdownProcessor.js`
- Modify: `tests/markdownProcessor.test.js`

**Step 1: Write test for waiting for diagrams**

```javascript
// Add to tests/markdownProcessor.test.js
import { MarkdownProcessor } from '../../src/markdownProcessor.js';

describe('MarkdownProcessor', () => {
  // ... existing tests ...

  describe('waitForDiagrams()', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
    });

    it('should resolve immediately when no diagrams present', async () => {
      const container = document.getElementById('test-container');

      const startTime = Date.now();
      await processor.waitForDiagrams(container);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should wait for SVG elements to be in DOM', async () => {
      const container = document.getElementById('test-container');

      const diagramContainer = document.createElement('div');
      diagramContainer.className = 'diagram-container';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      diagramContainer.appendChild(svg);
      container.appendChild(diagramContainer);

      await processor.waitForDiagrams(container);

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should handle multiple diagrams', async () => {
      const container = document.getElementById('test-container');

      for (let i = 0; i < 3; i++) {
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'diagram-container';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        diagramContainer.appendChild(svg);
        container.appendChild(diagramContainer);
      }

      await processor.waitForDiagrams(container);

      const svgs = container.querySelectorAll('.diagram-container svg');
      expect(svgs.length).toBe(3);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: FAIL with "processor.waitForDiagrams is not a function"

**Step 3: Implement waitForDiagrams method**

```javascript
// Add to MarkdownProcessor class in src/markdownProcessor.js

/**
 * Wait for diagrams to be fully rendered in the DOM
 * This ensures SVGs are ready before html2canvas captures them
 * @param {HTMLElement} container - The DOM container with diagrams
 * @returns {Promise<void>}
 */
async waitForDiagrams(container) {
  const diagrams = container.querySelectorAll('.diagram-container svg');

  // If no diagrams, resolve immediately
  if (diagrams.length === 0) {
    return Promise.resolve();
  }

  // Wait a few frames to ensure SVGs are fully rendered
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/markdownProcessor.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/markdownProcessor.js tests/markdownProcessor.test.js
git commit -m "feat: add waitForDiagrams method for html2canvas compatibility"
```

---

## Task 11: Integration with Existing PDF Generation

**Files:**
- Read: `src/pdf-generator.js` (to understand existing structure)
- Modify: As needed based on existing code

**Step 1: Examine existing PDF generation code**

Run: `cat src/pdf-generator.js`

**Step 2: Create integration wrapper**

```javascript
// src/diagramPdfIntegration.js
/**
 * Integration helper for diagram rendering with PDF generation
 * This module bridges the markdown processor with existing PDF generation
 */
import { MarkdownProcessor } from './markdownProcessor.js';

/**
 * Process markdown with diagrams and prepare for PDF generation
 * @param {string} markdown - The markdown text to process
 * @param {HTMLElement} container - The container element to render into
 * @returns {Promise<{container: HTMLElement, processor: MarkdownProcessor}>}
 */
export async function prepareMarkdownForPdf(markdown, container) {
  const processor = new MarkdownProcessor();

  // Process markdown to replace diagram blocks with placeholders
  const processedHtml = await processor.process(markdown);

  // Set container content
  container.innerHTML = processedHtml;

  // Render diagrams into placeholders
  await processor.renderDiagramsToDom(container);

  // Wait for diagrams to be fully rendered
  await processor.waitForDiagrams(container);

  return { container, processor };
}

/**
 * Convenience function to process and generate PDF-ready HTML
 * @param {string} markdown - The markdown text
 * @returns {Promise<string>} - HTML string ready for PDF generation
 */
export async function markdownToPdfReadyHtml(markdown) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  try {
    await prepareMarkdownForPdf(markdown, container);
    return container.innerHTML;
  } finally {
    document.body.removeChild(container);
  }
}
```

**Step 3: Write tests for integration**

```javascript
// tests/integration/pdfIntegration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prepareMarkdownForPdf, markdownToPdfReadyHtml } from '../../src/diagramPdfIntegration.js';

describe('PDF Integration with Diagrams', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should prepare markdown with diagrams for PDF generation', async () => {
    const markdown = `
# Test

\`\`\`mermaid
graph TD
A-->B
\`\`\`
    `;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const result = await prepareMarkdownForPdf(markdown, container);

    expect(result.container).toBe(container);
    expect(result.processor).toBeDefined();
    expect(container.innerHTML).toContain('diagram-container');
  });

  it('should generate HTML string ready for PDF', async () => {
    const markdown = `
\`\`\`mermaid
graph TD
A-->B
\`\`\`
    `;

    // Mock diagram manager
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle/></svg>';

    const html = await markdownToPdfReadyHtml(markdown);

    expect(html).toContain('<svg');
    expect(typeof html).toBe('string');
  });
});
```

**Step 4: Run tests**

Run: `npm test -- tests/integration/pdfIntegration.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/diagramPdfIntegration.js tests/integration/pdfIntegration.test.js
git commit -m "feat: add PDF integration helper for diagram rendering"
```

---

## Task 12: CSS Styles for Diagram Containers

**Files:**
- Create: `src/styles/diagramStyles.css`

**Step 1: Add CSS styles**

```css
/* src/styles/diagramStyles.css */

/* Container for rendered diagrams */
.diagram-container {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  text-align: center;
}

.diagram-container svg {
  max-width: 100%;
  height: auto;
  display: inline-block;
}

/* Placeholder while diagram is loading */
.diagram-placeholder {
  margin: 1.5rem 0;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  text-align: center;
  color: #666;
}

.diagram-placeholder::before {
  content: "Loading diagram...";
  font-style: italic;
}

/* Error display for failed diagrams */
.diagram-error {
  padding: 1rem;
  margin: 1.5rem 0;
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  background-color: #fff5f5;
  color: #c53030;
  font-family: monospace;
  font-size: 0.875rem;
}

.diagram-error::before {
  content: "⚠️ ";
}

/* Print styles */
@media print {
  .diagram-container {
    page-break-inside: avoid;
    border: none;
    background-color: transparent;
  }

  .diagram-error {
    page-break-inside: avoid;
  }
}
```

**Step 2: Create export for CSS**

```javascript
// src/styles/diagramStyles.js

/**
 * Get diagram CSS as a string
 * @returns {string} CSS styles
 */
export function getDiagramStyles() {
  return `
/* Container for rendered diagrams */
.diagram-container {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  text-align: center;
}

.diagram-container svg {
  max-width: 100%;
  height: auto;
  display: inline-block;
}

/* Placeholder while diagram is loading */
.diagram-placeholder {
  margin: 1.5rem 0;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  text-align: center;
  color: #666;
}

.diagram-placeholder::before {
  content: "Loading diagram...";
  font-style: italic;
}

/* Error display for failed diagrams */
.diagram-error {
  padding: 1rem;
  margin: 1.5rem 0;
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  background-color: #fff5f5;
  color: #c53030;
  font-family: monospace;
  font-size: 0.875rem;
}

.diagram-error::before {
  content: "⚠️ ";
}

/* Print styles */
@media print {
  .diagram-container {
    page-break-inside: avoid;
    border: none;
    background-color: transparent;
  }

  .diagram-error {
    page-break-inside: avoid;
  }
}
`;
}
```

**Step 3: Commit**

```bash
git add src/styles/diagramStyles.css src/styles/diagramStyles.js
git commit -m "feat: add CSS styles for diagram containers"
```

---

## Task 13: Documentation - Update README

**Files:**
- Modify: `README.md`

**Step 1: Add diagram support section to README**

```markdown
# Add to README.md after appropriate section

## Diagram Support

This application supports rendering various diagram types directly in markdown. Diagrams are rendered client-side using JavaScript libraries and included in PDF exports.

### Supported Diagram Languages

| Language | Description | Examples |
|----------|-------------|----------|
| **Mermaid** | Flowcharts, sequence diagrams, Gantt charts, state diagrams, ER diagrams, and more | [Mermaid Documentation](https://mermaid.js.org/) |
| **Graphviz (DOT)** | Graph visualization software with directed and undirected graphs | [Graphviz Documentation](https://graphviz.org/) |
| **Nomnoml** | UML diagrams with a simple syntax | [Nomnoml Documentation](https://nomnoml.com/) |
| **Pikchr** | PIC-like diagrams for technical illustrations | [Pikchr Documentation](https://pikchr.org/) |

### Usage

To include a diagram in your markdown, use a fenced code block with the appropriate language identifier:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E
\`\`\`

#### Mermaid Example

\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John!
    John-->>Alice: Hi Alice!
\`\`\`

#### Graphviz Example

\`\`\`dot
digraph G {
    rankdir=LR;
    A -> B;
    B -> C;
    C -> A;
}
\`\`\`

#### Nomnoml Example

\`\`\`nomnoml
[<frame>Architecture|
  [Frontend]-->[Backend]
  [Backend]-->[Database]
]
\`\`\`

#### Pikchr Example

\`\`\`pikchr
box "Server" width 1cm
arrow
box "Client" width 1cm
\`\`\`

### Browser Compatibility

Diagram rendering requires:
- Modern browser with ES6 module support
- JavaScript enabled
- Internet connection for loading diagram libraries from CDN (first load only)

### Limitations

- Diagram libraries are loaded from public CDNs
- Very large diagrams may take longer to render
- Complex diagrams may not render perfectly in PDF exports
- Some advanced library features may not be supported
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add diagram support documentation to README"
```

---

## Task 14: Add Example Markdown Files

**Files:**
- Create: `examples/diagrams/mermaid-flowchart.md`
- Create: `examples/diagrams/graphviz-graph.md`
- Create: `examples/diagrams/nomnoml-uml.md`
- Create: `examples/diagrams/pikchr-technical.md`
- Create: `examples/diagrams/mixed-diagrams.md`

**Step 1: Create example files**

```markdown
<!-- examples/diagrams/mermaid-flowchart.md -->
# Mermaid Flowchart Example

This document demonstrates Mermaid.js flowchart rendering.

## Simple Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Make request
    System->>Database: Query data
    Database-->>System: Return results
    System-->>User: Send response
\`\`\`

## State Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Success
    Processing --> Failed
    Success --> [*]
    Failed --> Idle
\`\`\`
```

```markdown
<!-- examples/diagrams/graphviz-graph.md -->
# Graphviz (DOT) Diagrams Example

This document demonstrates Graphviz DOT language rendering.

## Directed Graph

\`\`\`dot
digraph G {
    rankdir=TB;
    node [shape=box];
    A [label="Start"];
    B [label="Process"];
    C [label="End"];

    A -> B;
    B -> C;
}
\`\`\`

## Undirected Graph

\`\`\`graphviz
graph {
    layout=neato;
    A -- B;
    B -- C;
    C -- A;
    D -- A;
    D -- B;
    D -- C;
}
\`\`\`

## Complex Example

\`\`\`dot
digraph {
    node [fontname="Arial"];
    edge [fontname="Arial"];

    Start [shape=ellipse, style=filled, color=lightblue];
    Process [shape=box, style=filled, color=lightgrey];
    Decision [shape=diamond, style=filled, color=lightyellow];
    End [shape=ellipse, style=filled, color=lightgreen];

    Start -> Process;
    Process -> Decision;
    Decision -> End [label="Success"];
    Decision -> Process [label="Retry"];
}
\`\`\`
```

```markdown
<!-- examples/diagrams/nomnoml-uml.md -->
# Nomnoml UML Diagrams Example

This document demonstrates Nomnoml UML diagram rendering.

## Simple Class Diagram

\`\`\`nomnoml
[Customer]->[Order]
[Order]->[Product]
\`\`\`

## Class Relationship

\`\`\`nomnoml
[<abstract>User] ^:- [Admin]
[User] ^:- [Customer]
\`\`\`

## Architecture Diagram

\`\`\`nomnoml
[<frame>System Architecture|
  [<frame>Frontend|
    [React App]
    [State Management]
  ]
  [<frame>Backend|
    [API Server]
    [Authentication]
  ]
  [Database]
]

[Frontend] -> [Backend]
[Backend] -> [Database]
\`\`\`

## State Machine

\`\`\`nomnoml
[<start>Idle] -> [Processing]
[Processing] -> [<state>Success]
[Processing] -> [<state>Error]
[Success] -> [Idle]
[Error] -> [Idle]
\`\`\`
```

```markdown
<!-- examples/diagrams/pikchr-technical.md -->
# Pikchr Technical Diagrams Example

This document demonstrates Pikchr diagram rendering.

## Simple Box Diagram

\`\`\`pikchr
box "Server" width 1cm height 0.8cm
arrow right 0.5cm
box "Client" width 1cm height 0.8cm
\`\`\`

## Flow Diagram

\`\`\`pikchr
box "Input" width 1cm
arrow right 0.5cm "data"
box "Process" width 1.5cm
arrow right 0.5cm "result"
box "Output" width 1cm
\`\`\`

## Decision Tree

\`\`\`pikchr
box "Start" width 1cm
arrow right 0.5cm
diamond "Valid?" width 1cm height 0.7cm
arrow right 0.5cm "yes" "Continue"
arrow down 0.5cm "no" "Retry"

box "Continue" at 2.2cm 0
box "Retry" at 1.5cm -0.5cm
\`\`\`

## Network Diagram

\`\`\`pikchr
# Network topology
box "Router" width 1cm fill lightblue
arrow right 0.5cm
box "Switch" width 1cm fill lightgreen
arrow right 0.5cm
box "Server" width 1cm fill lightyellow

arrow from Switch down 0.5cm
box "Workstation" width 1cm at 2cm -0.8cm fill lightgrey
\`\`\`
```

```markdown
<!-- examples/diagrams/mixed-diagrams.md -->
# Mixed Diagram Types Example

This document demonstrates using multiple diagram types in a single document.

## Mermaid Flowchart

\`\`\`mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
\`\`\`

## Graphviz Graph

\`\`\`dot
digraph G {
    X -> Y;
    Y -> Z;
}
\`\`\`

## Nomnoml UML

\`\`\`nomnoml
[A]->[B]
[B]->[C]
\`\`\`

## Pikchr Diagram

\`\`\`pikchr
box "Step 1"
arrow
box "Step 2"
\`\`\`

## Integration Example

All diagram types can be used together:

1. Use Mermaid for flowcharts and sequences
2. Use Graphviz for complex graph layouts
3. Use Nomnoml for UML diagrams
4. Use Pikchr for technical illustrations

Each diagram is rendered independently and positioned in the document flow.
```

**Step 2: Commit**

```bash
git add examples/diagrams/
git commit -m "docs: add diagram example markdown files"
```

---

## Task 15: Final Integration Test - Full Workflow

**Files:**
- Create: `tests/integration/fullWorkflow.test.js`

**Step 1: Write comprehensive workflow test**

```javascript
// tests/integration/fullWorkflow.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownProcessor } from '../../src/markdownProcessor.js';
import { prepareMarkdownForPdf } from '../../src/diagramPdfIntegration.js';

describe('Full Diagram Workflow Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should handle complete markdown to PDF-ready HTML workflow', async () => {
    const markdown = `
# Technical Document

## System Architecture

Our system uses multiple components:

\`\`\`mermaid
graph TB
    Client[Client] --> API[API Gateway]
    API --> Service[Service Layer]
    Service --> DB[(Database)]
    API --> Cache[(Cache)]
\`\`\`

## Class Diagram

\`\`\`nomnoml
[APIGateway] <- [Service]
[Service] <- [Repository]
[Repository] -> [Database]
\`\`\`

## Network Topology

\`\`\`dot
digraph {
    rankdir=LR;
    Web [shape=box, style=filled, color=lightblue];
    App [shape=box, style=filled, color=lightgreen];
    DB [shape=cylinder, style=filled, color=lightyellow];

    Web -> App;
    App -> DB;
}
\`\`\`

This document demonstrates the complete workflow.
    `;

    // Create real DOM container
    const container = document.createElement('div');
    container.id = 'workflow-test';
    document.body.appendChild(container);

    // Mock diagram rendering
    const mockSvg = (id) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', id);
      svg.setAttribute('width', '200');
      svg.setAttribute('height', '150');
      return svg;
    };

    const processor = new MarkdownProcessor();

    let renderCallCount = 0;
    processor.diagramManager.renderDiagram = vi.fn()
      .mockImplementation(() => {
        renderCallCount++;
        return Promise.resolve(mockSvg(`diagram-${renderCallCount}`));
      });

    // Process markdown
    const processedHtml = await processor.process(markdown);
    expect(processedHtml).toContain('diagram-placeholder');
    expect(processedHtml).not.toContain('```mermaid');
    expect(processedHtml).not.toContain('```nomnoml');
    expect(processedHtml).not.toContain('```dot');

    // Render to DOM
    container.innerHTML = processedHtml;
    await processor.renderDiagramsToDom(container);
    await processor.waitForDiagrams(container);

    // Verify all diagrams were rendered
    const diagrams = container.querySelectorAll('.diagram-container svg');
    expect(diagrams.length).toBe(3);
    expect(processor.diagramManager.renderDiagram).toHaveBeenCalledTimes(3);

    // Verify content preservation
    expect(container.innerHTML).toContain('Technical Document');
    expect(container.innerHTML).toContain('System Architecture');
    expect(container.innerHTML).toContain('complete workflow');

    // Cleanup
    document.body.removeChild(container);
  });

  it('should handle errors in mixed diagram document', async () => {
    const markdown = `
\`\`\`mermaid
invalid syntax
\`\`\`

\`\`\`nomnoml
[Valid]->[Diagram]
\`\`\`
    `;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const processor = new MarkdownProcessor();

    processor.diagramManager.renderDiagram = vi.fn()
      .mockImplementation((lang, code) => {
        if (code.includes('invalid')) {
          return Promise.reject(new Error('Parse error'));
        }
        return Promise.resolve(
          document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        );
      });

    container.innerHTML = await processor.process(markdown);
    await processor.renderDiagramsToDom(container);

    // One error message, one successful diagram
    expect(container.querySelector('.diagram-error')).toBeTruthy();
    expect(container.querySelector('.diagram-container svg')).toBeTruthy();

    document.body.removeChild(container);
  });

  it('should preserve document structure with text and diagrams', async () => {
    const markdown = `# Title

Paragraph before diagram.

\`\`\`mermaid
graph TD
A-->B
\`\`\`

Paragraph after diagram.

## Section 2

More content.
    `;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const processor = new MarkdownProcessor();
    processor.diagramManager.renderDiagram = vi.fn()
      .mockResolvedValue(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));

    const result = await prepareMarkdownForPdf(markdown, container);

    const html = result.container.innerHTML;

    // Verify order
    const titlePos = html.indexOf('Title');
    const beforePos = html.indexOf('Paragraph before');
    const diagramPos = html.indexOf('diagram-container');
    const afterPos = html.indexOf('Paragraph after');
    const sectionPos = html.indexOf('Section 2');

    expect(titlePos).toBeLessThan(beforePos);
    expect(beforePos).toBeLessThan(diagramPos);
    expect(diagramPos).toBeLessThan(afterPos);
    expect(afterPos).toBeLessThan(sectionPos);

    document.body.removeChild(container);
  });
});
```

**Step 2: Run test**

Run: `npm test -- tests/integration/fullWorkflow.test.js`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/integration/fullWorkflow.test.js
git commit -m "test: add full workflow integration test"
```

---

## Completion Summary

After completing all tasks:

1. **DiagramManager** - Orchestrates multiple diagram renderers
2. **MarkdownProcessor** - Processes markdown and renders diagrams
3. **PDF Integration** - Bridges diagram processing with PDF generation
4. **CSS Styles** - Styling for diagram containers and errors
5. **Documentation** - README updates and example files
6. **Tests** - Comprehensive unit and integration tests

### Verification Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/DiagramManager.test.js
npm test -- tests/markdownProcessor.test.js
npm test -- tests/integration/

# Check code coverage
npm run test:coverage
```

### Files Modified/Created

**Core Implementation:**
- `src/DiagramManager.js` (new)
- `src/markdownProcessor.js` (new)
- `src/diagramPdfIntegration.js` (new)
- `src/styles/diagramStyles.js` (new)
- `src/styles/diagramStyles.css` (new)

**Tests:**
- `tests/DiagramManager.test.js` (new)
- `tests/markdownProcessor.test.js` (new)
- `tests/integration/diagramProcessing.test.js` (new)
- `tests/integration/pdfIntegration.test.js` (new)
- `tests/integration/fullWorkflow.test.js` (new)

**Documentation:**
- `README.md` (modified)
- `examples/diagrams/*.md` (new)

### Next Steps (Phase 5)

- Implement error handling improvements
- Add loading indicators
- Performance optimization
- User feedback mechanisms

---

**Generated with [Claude Code](https://claude.ai/code)**
**via [Happy](https://happy.engineering)**
