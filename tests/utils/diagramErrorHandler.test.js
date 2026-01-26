/**
 * Tests for diagramErrorHandler utilities
 * Tests error types, timeout handling, and error message generation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DiagramErrorType,
  DiagramRenderError,
  withTimeout,
  withErrorHandling,
  createErrorElement,
  createLoadingPlaceholder,
  updateLoadingProgress,
  logDiagramError
} from '../../src/utils/diagramErrorHandler.js';

describe('DiagramRenderError', () => {
  it('should create error with type and message', () => {
    const error = new DiagramRenderError(
      'Test error message',
      DiagramErrorType.SYNTAX_ERROR
    );

    expect(error.message).toBe('Test error message');
    expect(error.type).toBe(DiagramErrorType.SYNTAX_ERROR);
    expect(error.name).toBe('DiagramRenderError');
  });

  it('should create error with original error', () => {
    const originalError = new Error('Original error');
    const error = new DiagramRenderError(
      'Wrapped error',
      DiagramErrorType.UNKNOWN_ERROR,
      originalError
    );

    expect(error.originalError).toBe(originalError);
  });

  it('should return user-friendly message for syntax errors', () => {
    const error = new DiagramRenderError(
      'Invalid syntax',
      DiagramErrorType.SYNTAX_ERROR
    );

    expect(error.getUserMessage()).toBe(
      'The diagram syntax is invalid. Please check your diagram code for errors.'
    );
  });

  it('should return user-friendly message for library load errors', () => {
    const error = new DiagramRenderError(
      'Failed to load',
      DiagramErrorType.LIBRARY_LOAD_ERROR
    );

    expect(error.getUserMessage()).toBe(
      'Failed to load the diagram library. Please check your internet connection.'
    );
  });

  it('should return user-friendly message for timeout errors', () => {
    const error = new DiagramRenderError(
      'Timeout',
      DiagramErrorType.RENDER_TIMEOUT
    );

    expect(error.getUserMessage()).toBe(
      'The diagram took too long to render. Try simplifying it.'
    );
  });

  it('should return user-friendly message for unknown errors', () => {
    const error = new DiagramRenderError(
      'Unknown error',
      DiagramErrorType.UNKNOWN_ERROR
    );

    expect(error.getUserMessage()).toBe(
      'An unexpected error occurred while rendering the diagram.'
    );
  });

  it('should return debug message with original error', () => {
    const originalError = new Error('Original');
    originalError.stack = 'Error stack trace';

    const error = new DiagramRenderError(
      'Wrapped',
      DiagramErrorType.UNKNOWN_ERROR,
      originalError
    );

    const debugMessage = error.getDebugMessage();
    expect(debugMessage).toContain('Wrapped');
    expect(debugMessage).toContain('Original');
    expect(debugMessage).toContain('Error stack trace');
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve when promise completes before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 5000, 'Test operation');

    expect(result).toBe('success');
  });

  it('should reject when promise times out', async () => {
    const promise = new Promise(() => {}); // Never resolves

    const timeoutPromise = withTimeout(promise, 1000, 'Test operation');

    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('Test operation timed out after 1000ms');
  });

  it('should include timeout in error type', async () => {
    const promise = new Promise(() => {});
    const timeoutPromise = withTimeout(promise, 1000, 'Test');

    vi.advanceTimersByTime(1000);

    try {
      await timeoutPromise;
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.type).toBe(DiagramErrorType.RENDER_TIMEOUT);
    }
  });

  it('should reject immediately when promise rejects', async () => {
    const promise = Promise.reject(new Error('Immediate failure'));
    const timeoutPromise = withTimeout(promise, 5000, 'Test');

    await expect(timeoutPromise).rejects.toThrow('Immediate failure');
  });
});

describe('withErrorHandling', () => {
  it('should wrap render function with timeout protection', async () => {
    const mockRender = vi.fn().mockResolvedValue('<svg></svg>');
    const wrappedRender = withErrorHandling(mockRender, 'mermaid', { timeoutMs: 5000 });

    const result = await wrappedRender('graph TD\nA-->B');

    expect(result).toBe('<svg></svg>');
    expect(mockRender).toHaveBeenCalledWith('graph TD\nA-->B');
  });

  it('should detect and wrap syntax errors', async () => {
    const mockRender = vi.fn().mockRejectedValue(
      new Error('Syntax error in line 5')
    );

    const wrappedRender = withErrorHandling(mockRender, 'mermaid');

    try {
      await wrappedRender('invalid code');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagramRenderError);
      expect(error.type).toBe(DiagramErrorType.SYNTAX_ERROR);
    }
  });

  it('should detect and wrap library load errors', async () => {
    const mockRender = vi.fn().mockRejectedValue(
      new Error('Failed to load library from CDN')
    );

    const wrappedRender = withErrorHandling(mockRender, 'mermaid');

    try {
      await wrappedRender('code');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagramRenderError);
      expect(error.type).toBe(DiagramErrorType.LIBRARY_LOAD_ERROR);
    }
  });

  it('should wrap unknown errors', async () => {
    const mockRender = vi.fn().mockRejectedValue(
      new Error('Some unknown error')
    );

    const wrappedRender = withErrorHandling(mockRender, 'mermaid');

    try {
      await wrappedRender('code');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(DiagramRenderError);
      expect(error.type).toBe(DiagramErrorType.UNKNOWN_ERROR);
    }
  });
});

describe('createErrorElement', () => {
  it('should create error element with title and message', () => {
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.SYNTAX_ERROR
    );

    const element = createErrorElement(error, 'mermaid');

    expect(element.className).toContain('diagram-error');
    expect(element.querySelector('.diagram-error-title').textContent).toBe(
      'Mermaid Diagram Error'
    );
    expect(element.querySelector('.diagram-error-message').textContent).toContain(
      'syntax is invalid'
    );
  });

  it('should include technical details when original error exists', () => {
    const originalError = new Error('Original error');
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.UNKNOWN_ERROR,
      originalError
    );

    const element = createErrorElement(error, 'mermaid');

    const details = element.querySelector('.diagram-error-details');
    expect(details).toBeTruthy();
    expect(details.querySelector('summary').textContent).toBe('Technical details');
  });

  it('should include diagram code when provided', () => {
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.SYNTAX_ERROR
    );

    const code = 'graph TD\nA-->B';
    const element = createErrorElement(error, 'mermaid', code);

    const codeContent = element.querySelector('.diagram-error-code-content');
    expect(codeContent).toBeTruthy();
    expect(codeContent.textContent).toBe(code);
  });

  it('should set error type as data attribute', () => {
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.SYNTAX_ERROR
    );

    const element = createErrorElement(error, 'mermaid');

    expect(element.getAttribute('data-error-type')).toBe('syntax_error');
  });
});

describe('Loading Placeholder', () => {
  it('should create loading placeholder with spinner', () => {
    const placeholder = createLoadingPlaceholder('mermaid', 'diagram-123');

    expect(placeholder.className).toContain('diagram-loading');
    expect(placeholder.id).toBe('diagram-123');
    expect(placeholder.querySelector('.diagram-loading-spinner')).toBeTruthy();
  });

  it('should include loading text', () => {
    const placeholder = createLoadingPlaceholder('mermaid', 'diagram-123');

    const text = placeholder.querySelector('.diagram-loading-text');
    expect(text.textContent).toBe('Rendering mermaid diagram...');
  });

  it('should set language as data attribute', () => {
    const placeholder = createLoadingPlaceholder('dot', 'diagram-456');

    expect(placeholder.getAttribute('data-language')).toBe('dot');
  });
});

describe('updateLoadingProgress', () => {
  it('should update loading text', () => {
    const container = document.createElement('div');
    container.className = 'diagram-loading';
    const text = document.createElement('p');
    text.className = 'diagram-loading-text';
    text.textContent = 'Loading...';
    container.appendChild(text);

    updateLoadingProgress(container, 'Almost done...');

    expect(text.textContent).toBe('Almost done...');
  });

  it('should handle missing loading text element gracefully', () => {
    const container = document.createElement('div');
    container.className = 'diagram-loading';

    // Should not throw
    expect(() => {
      updateLoadingProgress(container, 'Progress');
    }).not.toThrow();
  });
});

describe('logDiagramError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'group');
    vi.spyOn(console, 'groupEnd');
    vi.spyOn(console, 'error');
    vi.spyOn(console, 'log');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log error with proper grouping', () => {
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.SYNTAX_ERROR
    );

    logDiagramError(error, 'mermaid', 'graph TD\nA-->B');

    expect(console.group).toHaveBeenCalledWith('❌ Diagram Rendering Error: MERMAID');
    expect(console.error).toHaveBeenCalledWith('User Message:', expect.any(String));
    expect(console.error).toHaveBeenCalledWith('Error Type:', 'syntax_error');
    expect(console.error).toHaveBeenCalledWith('Error Message:', 'Test error');
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('should log original error if present', () => {
    const originalError = new Error('Original');
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.UNKNOWN_ERROR,
      originalError
    );

    logDiagramError(error, 'dot', 'digraph G { A -> B; }');

    expect(console.error).toHaveBeenCalledWith('Original Error:', originalError);
  });

  it('should log diagram code in collapsed group', () => {
    const error = new DiagramRenderError(
      'Test error',
      DiagramErrorType.SYNTAX_ERROR
    );

    logDiagramError(error, 'mermaid', 'graph TD\nA-->B');

    expect(console.log).toHaveBeenCalledWith('graph TD\nA-->B');
  });
});
