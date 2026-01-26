/**
 * markdownDiagramProcessor - Processes markdown with diagrams
 * Converts markdown containing diagram code blocks to HTML with rendered SVG diagrams
 */

import { getDiagramBlocks } from './markdownParser.js';

/**
 * Process markdown and render diagrams to SVG
 * @param {string} markdown - The markdown text to process
 * @param {DiagramManager} diagramManager - The diagram manager instance
 * @returns {Promise<string>} - HTML string with rendered diagrams
 */
export async function renderMarkdownWithDiagrams(markdown, diagramManager) {
  // Check if the markdown has any diagram blocks
  const diagramBlocks = getDiagramBlocks(markdown);

  // If no diagrams, return as-is (or convert with basic markdown parser)
  if (diagramBlocks.length === 0) {
    return markdown;
  }

  // Process each diagram block
  let processedMarkdown = markdown;
  const replacements = [];

  // Process diagrams in reverse order to maintain correct indices
  for (let i = diagramBlocks.length - 1; i >= 0; i--) {
    const block = diagramBlocks[i];

    try {
      // Generate unique ID for this diagram
      const diagramId = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create placeholder HTML for the diagram
      const placeholder = `__DIAGRAM_PLACEHOLDER_${diagramId}__`;

      // Replace the code block with placeholder in reverse order
      const before = processedMarkdown.substring(0, block.startIndex);
      const after = processedMarkdown.substring(block.endIndex);
      processedMarkdown = before + placeholder + after;

      // Queue the diagram rendering for later replacement
      replacements.push({
        placeholder,
        diagramId,
        language: block.language,
        code: block.code
      });
    } catch (error) {
      console.error(`Failed to process diagram block:`, error);
      // Keep original code block if processing fails
    }
  }

  // Now render all diagrams and replace placeholders
  let html = processedMarkdown;

  for (const replacement of replacements) {
    try {
      // Render the diagram
      const svgElement = await diagramManager.renderDiagram(
        replacement.language,
        replacement.code
      );

      // Convert SVG element to HTML string
      const serializer = new XMLSerializer();
      const svgHtml = serializer.serializeToString(svgElement);

      // Create container div
      const containerHtml = `<div class="diagram-container" id="${replacement.diagramId}">${svgHtml}</div>`;

      // Replace placeholder with actual diagram HTML
      html = html.replace(replacement.placeholder, containerHtml);
    } catch (error) {
      // Create error container
      const errorHtml = `<div class="diagram-container diagram-error" id="${replacement.diagramId}">
        <p class="diagram-error-title">Error rendering ${replacement.language} diagram:</p>
        <pre class="diagram-error-message">${escapeHtml(error.message)}</pre>
      </div>`;

      html = html.replace(replacement.placeholder, errorHtml);
    }
  }

  return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Alternative implementation that works directly with DOM
 * Useful when you need more control over the DOM manipulation
 * @param {string} markdown - The markdown text to process
 * @param {DiagramManager} diagramManager - The diagram manager instance
 * @returns {Promise<DocumentFragment>} - Document fragment with rendered diagrams
 */
export async function renderMarkdownWithDiagramsAsDom(markdown, diagramManager) {
  const diagramBlocks = getDiagramBlocks(markdown);

  // Create a template element to parse the markdown
  const template = document.createElement('template');
  template.innerHTML = markdown;
  const fragment = template.content;

  // If no diagrams, return as-is
  if (diagramBlocks.length === 0) {
    return fragment;
  }

  // For each diagram block, find and replace the corresponding pre/code element
  for (const block of diagramBlocks) {
    try {
      // Find all pre/code elements in the fragment
      const codeElements = fragment.querySelectorAll('pre code');
      let targetElement = null;

      // Try to find the matching code element
      for (const codeEl of codeElements) {
        const languageClass = codeEl.className.match(/language-(\w+)/);
        if (languageClass && languageClass[1] === block.language) {
          // Check if the code content matches
          if (codeEl.textContent.trim() === block.code) {
            targetElement = codeEl.parentElement; // Get the pre element
            break;
          }
        }
      }

      if (!targetElement) {
        console.warn(`Could not find target element for ${block.language} diagram`);
        continue;
      }

      // Render the diagram
      const svgElement = await diagramManager.renderDiagram(
        block.language,
        block.code
      );

      // Create container div
      const container = document.createElement('div');
      container.className = 'diagram-container';
      container.id = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      container.appendChild(svgElement);

      // Replace the pre element with the diagram container
      targetElement.replaceWith(container);
    } catch (error) {
      console.error(`Failed to render ${block.language} diagram:`, error);

      // Create error container (if we found the target element)
      if (targetElement) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'diagram-container diagram-error';
        errorContainer.id = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const errorTitle = document.createElement('p');
        errorTitle.className = 'diagram-error-title';
        errorTitle.textContent = `Error rendering ${block.language} diagram:`;

        const errorMessage = document.createElement('pre');
        errorMessage.className = 'diagram-error-message';
        errorMessage.textContent = error.message;

        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMessage);

        targetElement.replaceWith(errorContainer);
      }
    }
  }

  return fragment;
}

/**
 * Process markdown with diagrams and return HTML string
 * This is a convenience wrapper that converts the DOM fragment to HTML
 * @param {string} markdown - The markdown text to process
 * @param {DiagramManager} diagramManager - The diagram manager instance
 * @returns {Promise<string>} - HTML string with rendered diagrams
 */
export async function renderMarkdownWithDiagramsToHtml(markdown, diagramManager) {
  const fragment = await renderMarkdownWithDiagramsAsDom(markdown, diagramManager);

  // Convert fragment to HTML string
  const div = document.createElement('div');
  div.appendChild(fragment.cloneNode(true));

  return div.innerHTML;
}
