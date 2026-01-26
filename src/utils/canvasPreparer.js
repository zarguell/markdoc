/**
 * canvasPreparer - Prepares SVG diagrams for html2canvas capture
 * Ensures SVGs have inline styles and proper attributes for PDF rendering
 */

/**
 * Prepare SVG diagrams in a container for html2canvas capture
 * This ensures SVG elements have inline styles and proper attributes
 * @param {HTMLElement} container - The container element with diagrams
 * @returns {Promise<void>} - Resolves when all diagrams are prepared
 */
export async function prepareDiagramsForCanvas(container) {
  if (!container) {
    console.warn('No container provided for diagram preparation');
    return;
  }

  // Find all diagram containers
  const diagramContainers = container.querySelectorAll('.diagram-container');

  for (const diagramContainer of diagramContainers) {
    try {
      const svg = diagramContainer.querySelector('svg');

      if (!svg) {
        console.warn('Diagram container found but no SVG element');
        continue;
      }

      // Ensure inline styles
      ensureInlineStyles(svg);

      // Ensure required attributes
      ensureRequiredAttributes(svg);

      // Remove transformations that html2canvas might reapply
      removeProblematicTransforms(svg);
    } catch (error) {
      console.error('Error preparing diagram for canvas:', error);
    }
  }
}

/**
 * Ensure SVG element has inline styles instead of CSS classes
 * html2canvas works better with inline styles
 * @param {SVGSVGElement} svg - The SVG element
 */
function ensureInlineStyles(svg) {
  const allElements = [svg, ...svg.querySelectorAll('*')];

  allElements.forEach(el => {
    try {
      const computed = window.getComputedStyle(el);

      // Copy essential properties to inline styles
      const props = [
        'fill',
        'stroke',
        'stroke-width',
        'stroke-dasharray',
        'stroke-linecap',
        'stroke-linejoin',
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'text-anchor',
        'opacity',
        'color',
        'background-color'
      ];

      props.forEach(prop => {
        const value = computed.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'auto') {
          el.style.setProperty(prop, value, 'important');
        }
      });
    } catch (error) {
      // Some elements might not support getComputedStyle
      // Ignore and continue
    }
  });
}

/**
 * Ensure SVG element has required attributes for proper rendering
 * @param {SVGSVGElement} svg - The SVG element
 */
function ensureRequiredAttributes(svg) {
  // Ensure viewBox is present
  if (!svg.hasAttribute('viewBox')) {
    const width = svg.getAttribute('width') || svg.clientWidth || 100;
    const height = svg.getAttribute('height') || svg.clientHeight || 100;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  // Ensure width and height are set
  if (!svg.getAttribute('width')) {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const [, , width] = viewBox.split(' ').map(Number);
      svg.setAttribute('width', width || 100);
    }
  }

  if (!svg.getAttribute('height')) {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const [, , , height] = viewBox.split(' ').map(Number);
      svg.setAttribute('height', height || 100);
    }
  }

  // Ensure xmlns is set
  if (!svg.hasAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
}

/**
 * Remove or fix problematic transformations
 * html2canvas can have issues with certain transforms
 * @param {SVGSVGElement} svg - The SVG element
 */
function removeProblematicTransforms(svg) {
  // html2canvas may reapply transforms on the root SVG element
  // Remove transform from root SVG if present
  if (svg.hasAttribute('transform')) {
    svg.removeAttribute('transform');
  }

  // Fix nested transforms that might cause issues
  const transformedElements = svg.querySelectorAll('[transform]');
  transformedElements.forEach(el => {
    try {
      const transform = el.getAttribute('transform');

      // Skip if it's a simple translate
      if (transform && transform.includes('matrix')) {
        // Complex transforms might cause issues
        // Consider if we need to handle this
      }
    } catch (error) {
      // Ignore transform parsing errors
    }
  });
}

/**
 * Wait for all diagrams in a container to be fully rendered
 * @param {HTMLElement} container - The container element
 * @param {number} timeout - Maximum time to wait in ms (default: 5000)
 * @returns {Promise<void>} - Resolves when diagrams are ready or timeout
 */
export function waitForDiagrams(container, timeout = 5000) {
  return new Promise((resolve) => {
    const diagrams = container.querySelectorAll('.diagram-container svg');

    if (diagrams.length === 0) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = 50; // Check every 50ms

    const checkReady = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= timeout) {
        console.warn('Timeout waiting for diagrams to render');
        resolve();
        return;
      }

      // Check if all SVGs are in DOM and have content
      let allReady = true;
      diagrams.forEach(svg => {
        if (!svg.parentElement || svg.children.length === 0) {
          allReady = false;
        }
      });

      if (allReady) {
        // Wait a few extra frames to ensure rendering is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
      } else {
        setTimeout(checkReady, checkInterval);
      }
    };

    checkReady();
  });
}

/**
 * Prepare diagrams and wait for them to be ready
 * Convenience function that combines preparation and waiting
 * @param {HTMLElement} container - The container element
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>} - Resolves when diagrams are ready
 */
export async function prepareAndWaitForDiagrams(container, timeout = 5000) {
  prepareDiagramsForCanvas(container);
  await waitForDiagrams(container, timeout);
}
