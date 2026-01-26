import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MermaidRenderer } from '../../src/renderers/mermaidRenderer.js';

// Mock the ScriptLoader and import
const mockLoadModule = vi.fn();
const mockMermaid = {
  initialize: vi.fn(),
  render: vi.fn().mockResolvedValue({
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g><text>Test</text></g></svg>'
  })
};

vi.mock('../../src/utils/scriptLoader.js', () => ({
  ScriptLoader: vi.fn().mockImplementation(() => ({
    loadModule: mockLoadModule
  }))
}));

// Mock the actual import
vi.mock('https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.esm.min.mjs', () => ({
  default: mockMermaid
}));

describe('MermaidRenderer', () => {
  let renderer;

  beforeEach(() => {
    vi.clearAllMocks();
    renderer = new MermaidRenderer();

    // Setup mock to return mermaid module
    mockLoadModule.mockResolvedValue({
      default: mockMermaid
    });
  });

  describe('initialize()', () => {
    it('should load mermaid library from CDN', async () => {
      await renderer.initialize();

      expect(renderer.initialized).toBe(true);
    });

    it('should initialize mermaid with startOnLoad set to false', async () => {
      await renderer.initialize();

      // Check that mermaid was initialized
      expect(mockMermaid.initialize).toHaveBeenCalledWith({
        startOnLoad: false,
        theme: 'default'
      });
    });

    it('should not re-initialize if already initialized', async () => {
      await renderer.initialize();
      const firstCall = mockMermaid.initialize.mock.calls.length;

      await renderer.initialize();

      expect(mockMermaid.initialize.mock.calls.length).toBe(firstCall);
    });

    it('should handle library loading errors gracefully', async () => {
      const errorRenderer = new MermaidRenderer();
      mockLoadModule.mockRejectedValue(new Error('Failed to load mermaid'));

      await expect(errorRenderer.initialize()).rejects.toThrow();
    });
  });

  describe('render()', () => {
    it('should render simple flowchart to SVG element', async () => {
      await renderer.initialize();
      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><g><rect x="10" y="10" width="80" height="40"/></g></svg>'
      });

      const code = 'graph TD\nA-->B';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
    });

    it('should throw error on invalid syntax', async () => {
      await renderer.initialize();
      mockMermaid.render.mockRejectedValue(new Error('Parse error'));

      const code = 'invalid mermaid syntax @#$';

      await expect(renderer.render(code)).rejects.toThrow('Mermaid rendering failed');
    });

    it('should generate unique IDs for each render', async () => {
      await renderer.initialize();
      // Make sure render returns success for both calls
      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g/></svg>'
      });

      const code = 'graph TD\nA-->B';
      await renderer.render(code);
      await renderer.render(code);

      expect(mockMermaid.render).toHaveBeenCalledTimes(2);
      const ids = mockMermaid.render.mock.calls.map(call => call[0]);
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('should apply inline styles to SVG', async () => {
      await renderer.initialize();
      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" style="fill: red;"><circle cx="50" cy="50" r="40" style="fill: blue;"/></svg>'
      });

      const code = 'graph TD\nA-->B';
      const svg = await renderer.render(code);

      expect(svg.querySelector('[style]')).toBeTruthy();
    });

    it('should auto-initialize if not already initialized', async () => {
      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>'
      });

      const code = 'graph TD\nA-->B';
      const svg = await renderer.render(code);

      expect(renderer.initialized).toBe(true);
      expect(svg).toBeInstanceOf(SVGSVGElement);
    });

    it('should render sequence diagrams', async () => {
      await renderer.initialize();
      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><text>Sequence</text></g></svg>'
      });

      const code = 'sequenceDiagram\nAlice->>John: Hello';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });
  });

  describe('integration', () => {
    it('should handle multiple diagrams independently', async () => {
      await renderer.initialize();

      const code1 = 'graph TD\nA-->B';
      const code2 = 'graph LR\nX-->Y';

      mockMermaid.render.mockResolvedValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>'
      });

      const svg1 = await renderer.render(code1);
      const svg2 = await renderer.render(code2);

      expect(svg1).toBeInstanceOf(SVGSVGElement);
      expect(svg2).toBeInstanceOf(SVGSVGElement);
      expect(svg1).not.toBe(svg2);
    });
  });
});
