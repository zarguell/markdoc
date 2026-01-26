import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VizRenderer } from '../../src/renderers/vizRenderer.js';

// Mock the ScriptLoader
vi.mock('../../src/utils/scriptLoader.js', () => ({
  ScriptLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn()
  }))
}));

describe('VizRenderer', () => {
  let renderer;
  let mockViz;

  beforeEach(() => {
    renderer = new VizRenderer();

    // Mock Viz instance
    mockViz = {
      renderSVGElement: vi.fn().mockResolvedValue(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      )
    };

    // Mock global Viz
    global.Viz = {
      instance: vi.fn().mockResolvedValue(mockViz)
    };
  });

  describe('initialize()', () => {
    it('should load viz library from CDN', async () => {
      await renderer.initialize();

      expect(renderer.initialized).toBe(true);
    });

    it('should create Viz instance', async () => {
      await renderer.initialize();

      expect(global.Viz.instance).toHaveBeenCalled();
      expect(renderer.viz).toBe(mockViz);
    });

    it('should not re-initialize if already initialized', async () => {
      await renderer.initialize();
      const firstCall = global.Viz.instance.mock.calls.length;

      await renderer.initialize();

      expect(global.Viz.instance.mock.calls.length).toBe(firstCall);
    });

    it('should handle library loading errors gracefully', async () => {
      const errorRenderer = new VizRenderer();
      global.Viz.instance = vi.fn().mockRejectedValue(new Error('Failed to load Viz'));

      await expect(errorRenderer.initialize()).rejects.toThrow();
    });
  });

  describe('render()', () => {
    beforeEach(async () => {
      await renderer.initialize();
    });

    it('should render simple DOT graph to SVG element', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockSvg.setAttribute('width', '100');
      mockSvg.setAttribute('height', '100');
      mockViz.renderSVGElement.mockResolvedValue(mockSvg);

      const code = 'digraph G { A -> B; }';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
    });

    it('should throw error on invalid syntax', async () => {
      mockViz.renderSVGElement.mockRejectedValue(new Error('Parse error'));

      const code = 'invalid dot syntax @#$';

      await expect(renderer.render(code)).rejects.toThrow('Graphviz rendering failed');
    });

    it('should apply inline styles to SVG', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '40');
      mockSvg.appendChild(circle);
      mockViz.renderSVGElement.mockResolvedValue(mockSvg);

      const code = 'digraph G { A -> B; }';
      const svg = await renderer.render(code);

      expect(svg).toBe(mockSvg);
    });

    it('should auto-initialize if not already initialized', async () => {
      const autoInitRenderer = new VizRenderer();
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockViz.renderSVGElement.mockResolvedValue(mockSvg);

      const code = 'digraph G { A -> B; }';
      const svg = await autoInitRenderer.render(code);

      expect(autoInitRenderer.initialized).toBe(true);
      expect(svg).toBeInstanceOf(SVGSVGElement);
    });

    it('should render undirected graphs', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockViz.renderSVGElement.mockResolvedValue(mockSvg);

      const code = 'graph { a -- b; b -- c; }';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });

    it('should render directed graphs', async () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockViz.renderSVGElement.mockResolvedValue(mockSvg);

      const code = 'digraph G { A -> B -> C; }';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });
  });

  describe('integration', () => {
    beforeEach(async () => {
      await renderer.initialize();
    });

    it('should handle multiple graphs independently', async () => {
      const mockSvg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const mockSvg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockViz.renderSVGElement
        .mockResolvedValueOnce(mockSvg1)
        .mockResolvedValueOnce(mockSvg2);

      const code1 = 'digraph G1 { A -> B; }';
      const code2 = 'digraph G2 { X -> Y; }';

      const svg1 = await renderer.render(code1);
      const svg2 = await renderer.render(code2);

      expect(svg1).toBeInstanceOf(SVGSVGElement);
      expect(svg2).toBeInstanceOf(SVGSVGElement);
      expect(svg1).not.toBe(svg2);
    });
  });
});
