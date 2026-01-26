import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PikchrRenderer } from '../../src/renderers/pikchrRenderer.js';

// Mock the ScriptLoader
const mockLoad = vi.fn().mockResolvedValue(undefined);
vi.mock('../../src/utils/scriptLoader.js', () => ({
  ScriptLoader: vi.fn().mockImplementation(() => ({
    load: mockLoad
  }))
}));

describe('PikchrRenderer', () => {
  let renderer;

  beforeEach(() => {
    vi.clearAllMocks();
    renderer = new PikchrRenderer();

    // Mock global pikchr
    global.pikchr = vi.fn().mockReturnValue({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><g><text>Test</text></g></svg>',
      width: 200,
      height: 100,
      error: null
    });
  });

  describe('initialize()', () => {
    it('should load pikchr library from CDN', async () => {
      await renderer.initialize();

      expect(renderer.initialized).toBe(true);
    });

    it('should not re-initialize if already initialized', async () => {
      await renderer.initialize();
      const initialized = renderer.initialized;

      await renderer.initialize();

      expect(renderer.initialized).toBe(initialized);
    });

    it('should handle library loading errors gracefully', async () => {
      mockLoad.mockRejectedValueOnce(new Error('Failed to load pikchr'));
      const errorRenderer = new PikchrRenderer();

      await expect(errorRenderer.initialize()).rejects.toThrow('Failed to initialize Pikchr');
    });
  });

  describe('render()', () => {
    beforeEach(async () => {
      await renderer.initialize();
    });

    it('should render simple diagram to SVG element', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><g><rect x="10" y="10" width="80" height="40"/></g></svg>',
        width: 200,
        height: 100,
        error: null
      });

      const code = 'box "Server"; arrow; box "Client"';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
    });

    it('should throw error on invalid syntax', async () => {
      global.pikchr.mockReturnValue({
        svg: '',
        width: 0,
        height: 0,
        error: 'Parse error: invalid syntax'
      });

      const code = 'invalid pikchr syntax @#$';

      await expect(renderer.render(code)).rejects.toThrow('Pikchr rendering failed');
    });

    it('should convert SVG string to SVG element', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="75"><g/></svg>',
        width: 150,
        height: 75,
        error: null
      });

      const code = 'circle "Start"; arrow; box "Process"';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
      expect(svg.getAttribute('width')).toBe('150');
      expect(svg.getAttribute('height')).toBe('75');
    });

    it('should set width and height attributes from result', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>',
        width: 300,
        height: 150,
        error: null
      });

      const code = 'box "A"';
      const svg = await renderer.render(code);

      expect(svg.getAttribute('width')).toBe('300');
      expect(svg.getAttribute('height')).toBe('150');
    });

    it('should apply inline styles to SVG', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg" style="fill: red;"><circle cx="50" cy="50" r="40" style="fill: blue;"/></svg>',
        width: 100,
        height: 100,
        error: null
      });

      const code = 'circle "Test"';
      const svg = await renderer.render(code);

      expect(svg.querySelector('[style]')).toBeTruthy();
    });

    it('should auto-initialize if not already initialized', async () => {
      const autoInitRenderer = new PikchrRenderer();
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>',
        width: 100,
        height: 100,
        error: null
      });

      const code = 'box "A"';
      const svg = await autoInitRenderer.render(code);

      expect(autoInitRenderer.initialized).toBe(true);
      expect(svg).toBeInstanceOf(SVGSVGElement);
    });

    it('should render boxes', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><rect/></g></svg>',
        width: 100,
        height: 50,
        error: null
      });

      const code = 'box "Hello World"';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });

    it('should render circles', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><circle/></g></svg>',
        width: 80,
        height: 80,
        error: null
      });

      const code = 'circle "Start"';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });

    it('should render arrows', async () => {
      global.pikchr.mockReturnValue({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><line/></g></svg>',
        width: 200,
        height: 50,
        error: null
      });

      const code = 'arrow';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });
  });

  describe('integration', () => {
    beforeEach(async () => {
      await renderer.initialize();
    });

    it('should handle multiple diagrams independently', async () => {
      let callCount = 0;
      global.pikchr.mockImplementation(() => {
        callCount++;
        return {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" id="svg${callCount}"><g/></svg>`,
          width: 100 * callCount,
          height: 100,
          error: null
        };
      });

      const code1 = 'box "A"';
      const code2 = 'box "B"';

      const svg1 = await renderer.render(code1);
      const svg2 = await renderer.render(code2);

      expect(svg1).toBeInstanceOf(SVGSVGElement);
      expect(svg2).toBeInstanceOf(SVGSVGElement);
      expect(svg1).not.toBe(svg2);
      expect(svg1.getAttribute('width')).toBe('100');
      expect(svg2.getAttribute('width')).toBe('200');
    });
  });
});
