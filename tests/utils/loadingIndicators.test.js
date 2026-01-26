/**
 * Tests for loading indicators in diagram rendering
 * Tests loading states, placeholder updates, and DOM manipulation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createLoadingPlaceholder,
  updateLoadingProgress
} from '../../src/utils/diagramErrorHandler.js';

describe('Loading Indicators', () => {
  describe('createLoadingPlaceholder', () => {
    it('should create placeholder with correct structure', () => {
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-test-1');

      expect(placeholder.tagName).toBe('DIV');
      expect(placeholder.className).toBe('diagram-container diagram-loading');
      expect(placeholder.id).toBe('diagram-test-1');
    });

    it('should include spinner element', () => {
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');

      const spinner = placeholder.querySelector('.diagram-loading-spinner');
      expect(spinner).toBeTruthy();
      expect(spinner.tagName).toBe('DIV');
    });

    it('should include loading text element', () => {
      const placeholder = createLoadingPlaceholder('dot', 'diagram-2');

      const text = placeholder.querySelector('.diagram-loading-text');
      expect(text).toBeTruthy();
      expect(text.tagName).toBe('P');
    });

    it('should customize loading text for different languages', () => {
      const mermaidPlaceholder = createLoadingPlaceholder('mermaid', 'd-1');
      const dotPlaceholder = createLoadingPlaceholder('dot', 'd-2');
      const nomnomlPlaceholder = createLoadingPlaceholder('nomnoml', 'd-3');

      expect(mermaidPlaceholder.querySelector('.diagram-loading-text').textContent).toBe(
        'Rendering mermaid diagram...'
      );
      expect(dotPlaceholder.querySelector('.diagram-loading-text').textContent).toBe(
        'Rendering dot diagram...'
      );
      expect(nomnomlPlaceholder.querySelector('.diagram-loading-text').textContent).toBe(
        'Rendering nomnoml diagram...'
      );
    });

    it('should set language as data attribute', () => {
      const placeholder = createLoadingPlaceholder('pikchr', 'diagram-3');

      expect(placeholder.getAttribute('data-language')).toBe('pikchr');
    });

    it('should generate unique IDs', () => {
      const placeholder1 = createLoadingPlaceholder('mermaid', 'diagram-1');
      const placeholder2 = createLoadingPlaceholder('mermaid', 'diagram-2');

      expect(placeholder1.id).not.toBe(placeholder2.id);
    });

    it('should be valid DOM element', () => {
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');

      // Should be able to append to DOM
      const container = document.createElement('div');
      expect(() => {
        container.appendChild(placeholder);
      }).not.toThrow();

      expect(container.contains(placeholder)).toBe(true);
    });
  });

  describe('Loading Spinner Animation', () => {
    it('should have spinner CSS class', () => {
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');
      const spinner = placeholder.querySelector('.diagram-loading-spinner');

      expect(spinner.className).toBe('diagram-loading-spinner');
    });
  });

  describe('updateLoadingProgress', () => {
    let container;

    beforeEach(() => {
      container = createLoadingPlaceholder('mermaid', 'test-diagram');
    });

    it('should update loading text message', () => {
      updateLoadingProgress(container, 'Loading library...');

      const text = container.querySelector('.diagram-loading-text');
      expect(text.textContent).toBe('Loading library...');
    });

    it('should handle multiple updates', () => {
      const text = container.querySelector('.diagram-loading-text');

      updateLoadingProgress(container, 'Step 1: Initializing...');
      expect(text.textContent).toBe('Step 1: Initializing...');

      updateLoadingProgress(container, 'Step 2: Parsing...');
      expect(text.textContent).toBe('Step 2: Parsing...');

      updateLoadingProgress(container, 'Step 3: Rendering...');
      expect(text.textContent).toBe('Step 3: Rendering...');
    });

    it('should handle empty string', () => {
      updateLoadingProgress(container, '');

      const text = container.querySelector('.diagram-loading-text');
      expect(text.textContent).toBe('');
    });

    it('should handle special characters', () => {
      const specialMessage = 'Rendering... 50% complete ✓';
      updateLoadingProgress(container, specialMessage);

      const text = container.querySelector('.diagram-loading-text');
      expect(text.textContent).toBe(specialMessage);
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long loading message that contains a lot of information about the current progress of the diagram rendering operation';
      updateLoadingProgress(container, longMessage);

      const text = container.querySelector('.diagram-loading-text');
      expect(text.textContent).toBe(longMessage);
    });

    it('should not throw if loading text element is missing', () => {
      const emptyContainer = document.createElement('div');
      emptyContainer.className = 'diagram-loading';

      expect(() => {
        updateLoadingProgress(emptyContainer, 'Progress');
      }).not.toThrow();
    });

    it('should not throw if container has no text element', () => {
      const containerWithoutText = document.createElement('div');
      containerWithoutText.innerHTML = '<div class="spinner"></div>';

      expect(() => {
        updateLoadingProgress(containerWithoutText, 'Progress');
      }).not.toThrow();
    });
  });

  describe('DOM Integration', () => {
    it('should be replaceable in DOM', () => {
      const container = document.createElement('div');
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');

      container.appendChild(placeholder);

      // Create replacement element
      const replacement = document.createElement('div');
      replacement.className = 'diagram-container';
      replacement.textContent = 'Rendered';

      // Replace
      placeholder.replaceWith(replacement);

      expect(container.contains(placeholder)).toBe(false);
      expect(container.contains(replacement)).toBe(true);
    });

    it('should maintain ID when replaced', () => {
      const container = document.createElement('div');
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-123');

      container.appendChild(placeholder);
      const originalId = placeholder.id;

      // Replace with error element
      const errorElement = document.createElement('div');
      errorElement.id = originalId;
      errorElement.className = 'diagram-error';

      placeholder.replaceWith(errorElement);

      expect(container.querySelector('#' + originalId)).toBe(errorElement);
    });

    it('should work with multiple placeholders simultaneously', () => {
      const container = document.createElement('div');

      const placeholder1 = createLoadingPlaceholder('mermaid', 'd-1');
      const placeholder2 = createLoadingPlaceholder('dot', 'd-2');
      const placeholder3 = createLoadingPlaceholder('nomnoml', 'd-3');

      container.appendChild(placeholder1);
      container.appendChild(placeholder2);
      container.appendChild(placeholder3);

      expect(container.children.length).toBe(3);
      expect(container.contains(placeholder1)).toBe(true);
      expect(container.contains(placeholder2)).toBe(true);
      expect(container.contains(placeholder3)).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive loading text', () => {
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');
      const text = placeholder.querySelector('.diagram-loading-text');

      expect(text.textContent.length).toBeGreaterThan(0);
      expect(text.textContent).toContain('mermaid');
      expect(text.textContent).toContain('diagram');
    });

    it('should provide context about what is loading', () => {
      const languages = ['mermaid', 'dot', 'graphviz', 'nomnoml', 'pikchr'];

      languages.forEach(lang => {
        const placeholder = createLoadingPlaceholder(lang, `d-${lang}`);
        const text = placeholder.querySelector('.diagram-loading-text');

        expect(text.textContent.toLowerCase()).toContain(lang);
      });
    });
  });

  describe('Visual Consistency', () => {
    it('should have consistent class names across languages', () => {
      const languages = ['mermaid', 'dot', 'nomnoml', 'pikchr'];

      languages.forEach(lang => {
        const placeholder = createLoadingPlaceholder(lang, `d-${lang}`);

        expect(placeholder.classList.contains('diagram-container')).toBe(true);
        expect(placeholder.classList.contains('diagram-loading')).toBe(true);
        expect(placeholder.querySelector('.diagram-loading-spinner')).toBeTruthy();
        expect(placeholder.querySelector('.diagram-loading-text')).toBeTruthy();
      });
    });

    it('should maintain consistent structure', () => {
      const placeholder1 = createLoadingPlaceholder('mermaid', 'd-1');
      const placeholder2 = createLoadingPlaceholder('dot', 'd-2');

      const children1 = Array.from(placeholder1.children);
      const children2 = Array.from(placeholder2.children);

      expect(children1.length).toBe(children2.length);
      expect(children1[0].className).toBe(children2[0].className); // Spinner
      expect(children1[1].className).toBe(children2[1].className); // Text
    });
  });

  describe('Error Recovery', () => {
    it('should allow replacement with error element', () => {
      const container = document.createElement('div');
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-1');

      container.appendChild(placeholder);

      // Simulate error and replace with error element
      const errorElement = document.createElement('div');
      errorElement.className = 'diagram-container diagram-error';
      errorElement.id = placeholder.id;

      placeholder.replaceWith(errorElement);

      expect(container.querySelector('.diagram-error')).toBeTruthy();
      expect(container.querySelector('.diagram-loading')).toBeNull();
    });

    it('should preserve ID during error replacement', () => {
      const container = document.createElement('div');
      const placeholder = createLoadingPlaceholder('mermaid', 'diagram-xyz');

      container.appendChild(placeholder);
      const originalId = placeholder.id;

      // Create error element with same ID
      const errorElement = document.createElement('div');
      errorElement.className = 'diagram-error';
      errorElement.id = originalId;

      placeholder.replaceWith(errorElement);

      const replacedElement = container.querySelector('#' + originalId);
      expect(replacedElement).toBeTruthy();
      expect(replacedElement.className).toBe('diagram-error');
    });
  });
});
