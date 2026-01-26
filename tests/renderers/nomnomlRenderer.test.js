import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NomnomlRenderer } from '../../src/renderers/nomnomlRenderer.js';

// Mock the ScriptLoader
vi.mock('../../src/utils/scriptLoader.js', () => ({
  ScriptLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn()
  }))
}));

describe('NomnomlRenderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new NomnomlRenderer();

    // Mock global nomnoml
    global.nomnoml = {
      renderSvg: vi.fn().mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><g><text>Test</text></g></svg>'
      )
    };
  });

  describe('initialize()', () => {
    it('should load nomnoml library from CDN', async () => {
      await renderer.initialize();

      expect(renderer.initialized).toBe(true);
    });

    it('should load graphre dependency first', async () => {
      const loader = renderer.loader || new (await import('../../src/utils/scriptLoader.js')).ScriptLoader();
      const loadSpy = vi.spyOn(loader, 'load');

      await renderer.initialize();

      // Check that both dependencies were loaded
      expect(loadSpy).toHaveBeenCalledWith(
        'https://unpkg.com/graphre/dist/graphre.js'
      );
      expect(loadSpy).toHaveBeenCalledWith(
        'https://unpkg.com/nomnoml/dist/nomnoml.js'
      );
    });

    it('should not re-initialize if already initialized', async () => {
      await renderer.initialize();
      const initialized = renderer.initialized;

      await renderer.initialize();

      expect(renderer.initialized).toBe(initialized);
    });

    it('should handle library loading errors gracefully', async () => {
      const errorRenderer = new NomnomlRenderer();
      errorRenderer.loader = {
        load: vi.fn().mockRejectedValue(new Error('Failed to load nomnoml'))
      };

      await expect(errorRenderer.initialize()).rejects.toThrow();
    });
  });

  describe('render()', () => {
    beforeEach(async () => {
      await renderer.initialize();
    });

    it('should render simple UML diagram to SVG element', async () => {
      global.nomnoml.renderSvg.mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><g><rect x="10" y="10" width="80" height="40"/></g></svg>'
      );

      const code = '[A]->[B]';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
    });

    it('should throw error on invalid syntax', () => {
      global.nomnoml.renderSvg.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const code = 'invalid nomnoml syntax @#$';

      return expect(renderer.render(code)).rejects.toThrow('Nomnoml rendering failed');
    });

    it('should convert SVG string to SVG element', async () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="75"><g/></svg>';
      global.nomnoml.renderSvg.mockReturnValue(svgString);

      const code = '[A]->[B]';
      const svg = await renderer.render(code);

      expect(svg).toBeInstanceOf(SVGSVGElement);
      expect(svg.tagName).toBe('svg');
      expect(svg.getAttribute('width')).toBe('150');
      expect(svg.getAttribute('height')).toBe('75');
    });

    it('should apply inline styles to SVG', async () => {
      global.nomnoml.renderSvg.mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg" style="fill: red;"><circle cx="50" cy="50" r="40" style="fill: blue;"/></svg>'
      );

      const code = '[A]->[B]';
      const svg = await renderer.render(code);

      expect(svg.querySelector('[style]')).toBeTruthy();
    });

    it('should auto-initialize if not already initialized', async () => {
      const autoInitRenderer = new NomnomlRenderer();
      global.nomnoml.renderSvg.mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>'
      );

      const code = '[A]->[B]';
      const svg = await autoInitRenderer.render(code);

      expect(autoInitRenderer.initialized).toBe(true);
      expect(svg).toBeInstanceOf(SVGSVGElement);
    });

    it('should render class diagrams', async () => {
      global.nomnoml.renderSvg.mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg"><g><text>Class</text></g></svg>'
      );

      const code = '[<class>Customer|name;email|login()]';
      const svg = await renderer.render(code);

      expect(svg.tagName).toBe('svg');
    });

    it('should render association', async () => {
      global.nomnoml.renderSvg.mockReturnValue(
        '<svg xmlns="http://www.w3.org/2000/svg"><g><line/></g></svg>'
      );

      const code = '[Customer]->[Order]';
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
      global.nomnoml.renderSvg.mockImplementation(() => {
        callCount++;
        return `<svg xmlns="http://www.w3.org/2000/svg" id="svg${callCount}"><g/></svg>`;
      });

      const code1 = '[A]->[B]';
      const code2 = '[X]->[Y]';

      const svg1 = await renderer.render(code1);
      const svg2 = await renderer.render(code2);

      expect(svg1).toBeInstanceOf(SVGSVGElement);
      expect(svg2).toBeInstanceOf(SVGSVGElement);
      expect(svg1).not.toBe(svg2);
    });
  });
});
