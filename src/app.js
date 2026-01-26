// Import npm dependencies
import { marked } from 'marked';

// Import styles
import './styles.css';

// Import application modules
import './snippet-library.js';

// Import diagram rendering system
import { DiagramManager } from './DiagramManager.js';
import { renderMarkdownWithDiagramsToHtml } from './utils/markdownDiagramProcessor.js';

// Make marked available globally for legacy module compatibility
window.marked = marked;

// Utility Functions
function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        return 'browsermark-document';
    }

    // Trim whitespace
    let sanitized = filename.trim();

    // Return default if empty
    if (!sanitized) {
        return 'browsermark-document';
    }

    // Convert to lowercase
    sanitized = sanitized.toLowerCase();

    // Replace spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-');

    // Remove/replace invalid filesystem characters
    // Keep only letters, numbers, hyphens, underscores, and dots
    sanitized = sanitized.replace(/[^a-z0-9\-_\.]/g, '');

    // Remove multiple consecutive hyphens/underscores
    sanitized = sanitized.replace(/[-_]{2,}/g, '-');

    // Trim hyphens/underscores from start and end
    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '');

    // Ensure reasonable length (max 100 characters)
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
        // Trim trailing hyphens/underscores after truncation
        sanitized = sanitized.replace(/[-_]+$/g, '');
    }

    // Ensure not empty after sanitization
    if (!sanitized) {
        return 'browsermark-document';
    }

    return sanitized;
}

function extractFirstHeader(markdown) {
    if (!markdown || typeof markdown !== 'string') {
        return null;
    }

    // Match the first # header (h1)
    const headerMatch = markdown.match(/^#\s+(.+)$/m);
    if (headerMatch && headerMatch[1]) {
        return headerMatch[1].trim();
    }

    return null;
}

// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdown-input');
    const previewContent = document.getElementById('preview-content');
    const exportBtn = document.getElementById('export-btn');
    const exportDocxBtn = document.getElementById('export-docx-btn');
    const exportMhtmlBtn = document.getElementById('export-mhtml-btn');
    const printBtn = document.getElementById('print-btn');
    const optionsToggle = document.getElementById('options-toggle');
    const optionsPanel = document.getElementById('options-panel');
    const headerInput = document.getElementById('header-input');
    const footerInput = document.getElementById('footer-input');
    const pageNumbersCheckbox = document.getElementById('page-numbers-checkbox');
    const linkUrlsCheckbox = document.getElementById('link-urls-checkbox');
    const wordHeadersCheckbox = document.getElementById('word-headers-checkbox');
    const fontSelect = document.getElementById('font-select');
    const filenameInput = document.getElementById('filename-input');
    const autoFilenameCheckbox = document.getElementById('auto-filename-checkbox');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.getElementById('help-close');

    // Generator caches for lazy loading
    let pdfGenerator = null;
    let docxGenerator = null;
    let mhtmlGenerator = null;

    // Initialize Snippet Library
    window.snippetLibrary = new SnippetLibrary();
    window.snippetLibrary.init();

    // Initialize Diagram Manager
    const diagramManager = new DiagramManager();

    // Default markdown text
    const defaultText = `# Welcome to browsermark

browsermark is a simple markdown to PDF converter that generates high-quality documents.

## Features

- Live preview of your markdown
- **Diagram Support**: Mermaid, Graphviz, Nomnoml, and Pikchr diagrams
- Custom headers and footers
- Page numbering support
- Clean, professional PDF output

\`\`\`javascript
// Example code block
function hello() {
    console.log('Hello, browsermark!');
}
\`\`\`

## Example Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E
\`\`\`

> This is a blockquote example.
`;
    input.value = defaultText;

    // Update preview function (now async for diagram rendering)
    async function updatePreview() {
        const text = input.value;

        try {
            // Import needed functions
            const { getDiagramBlocks } = await import('./utils/markdownParser.js');

            // Check if there are any diagram blocks in the raw markdown
            const diagramBlocks = getDiagramBlocks(text);

            if (diagramBlocks.length > 0) {
                // Has diagrams - parse markdown to HTML first
                const html = marked.parse(text);

                // Create a temporary container
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Find all code blocks with diagram languages
                const codeElements = tempDiv.querySelectorAll('pre code');

                for (const codeEl of codeElements) {
                    // Get the language from the class (marked adds "language-xxx" classes)
                    const classList = Array.from(codeEl.classList);
                    const languageClass = classList.find(cls => cls.startsWith('language-'));

                    if (languageClass) {
                        const language = languageClass.replace('language-', '');

                        // Check if this is a diagram language
                        if (['mermaid', 'dot', 'graphviz', 'nomnoml', 'pikchr'].includes(language)) {
                            const diagramCode = codeEl.textContent;

                            try {
                                // Show loading indicator before rendering
                                const preElement = codeEl.parentElement;
                                const loadingDiv = document.createElement('div');
                                loadingDiv.className = 'diagram-container diagram-loading';
                                loadingDiv.innerHTML = `<p class="diagram-loading-message">Loading ${language} renderer...</p>`;
                                preElement.replaceWith(loadingDiv);

                                // Render the diagram
                                const svgElement = await diagramManager.renderDiagram(language, diagramCode);

                                // Replace loading indicator with diagram
                                const container = document.createElement('div');
                                container.className = 'diagram-container';
                                container.appendChild(svgElement);
                                loadingDiv.replaceWith(container);
                            } catch (error) {
                                // Show error in place of diagram
                                console.error(`Failed to render ${language} diagram:`, error);
                                const preElement = codeEl.parentElement;
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'diagram-container diagram-error';
                                errorDiv.innerHTML = `<p class="diagram-error-title">Error rendering ${language} diagram:</p>
                                    <pre class="diagram-error-message">${error.message}</pre>`;
                                preElement.replaceWith(errorDiv);
                            }
                        }
                    }
                }

                previewContent.innerHTML = tempDiv.innerHTML;
            } else {
                // No diagrams - simple markdown parse
                previewContent.innerHTML = marked.parse(text);
            }
        } catch (error) {
            console.error('Preview rendering error:', error);
            // Fallback to basic markdown
            previewContent.innerHTML = marked.parse(text);
        }
    }

    // Options panel toggle
    optionsToggle.addEventListener('click', () => {
        optionsPanel.classList.toggle('collapsed');
        optionsToggle.textContent = optionsPanel.classList.contains('collapsed') ? 'Show Options' : 'Hide Options';
    });

    // Function to update print CSS variables
    function updatePrintOptions() {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;
        const showLinkUrls = linkUrlsCheckbox.checked;

        document.documentElement.style.setProperty('--header-text', `"${headerText}"`);
        document.documentElement.style.setProperty('--footer-text', `"${footerText}"`);
        document.documentElement.style.setProperty('--page-numbers', includePageNumbers ? '' : 'none');
        document.documentElement.style.setProperty('--show-link-urls', showLinkUrls ? 'inline' : 'none');
    }

    // Function to update styling options
    function updateStylingOptions() {
        const useWordHeaders = wordHeadersCheckbox.checked;
        const selectedFont = fontSelect.value;

        // Remove existing styling classes
        previewContent.classList.remove('word-headers', 'font-default', 'font-calibri', 'font-times', 'font-arial');

        // Add new styling classes
        if (useWordHeaders) {
            previewContent.classList.add('word-headers');
        }
        previewContent.classList.add(`font-${selectedFont}`);
    }

    // Function to get the effective filename
    function getEffectiveFilename(extension = '') {
        let filename = filenameInput.value.trim();

        // If auto-filename is enabled, try to extract from first header
        if (autoFilenameCheckbox.checked) {
            const headerText = extractFirstHeader(input.value);
            if (headerText) {
                filename = headerText;
            }
        }

        // Sanitize the filename
        const sanitized = sanitizeFilename(filename);

        // Add extension if provided
        return extension ? `${sanitized}${extension}` : sanitized;
    }

    // Export PDF with options - Lazy load on click
    exportBtn.addEventListener('click', async () => {
        try {
            exportBtn.textContent = 'Loading PDF Export...';
            exportBtn.disabled = true;

            if (!pdfGenerator) {
                const module = await import('./pdf-generator.js');
                pdfGenerator = new module.PDFGenerator();
            }

            const headerText = headerInput.value.trim();
            const footerText = footerInput.value.trim();
            const includePageNumbers = pageNumbersCheckbox.checked;
            const filename = getEffectiveFilename('.pdf');

            pdfGenerator.setOptions(headerText, footerText, includePageNumbers);
            pdfGenerator.generatePDF(previewContent, filename);
        } catch (error) {
            console.error('Failed to load PDF generator:', error);
            alert('Failed to load PDF export functionality. Please refresh and try again.');
        } finally {
            exportBtn.textContent = 'Export PDF';
            exportBtn.disabled = false;
        }
    });

    // Export DOCX - Lazy load on click
    exportDocxBtn.addEventListener('click', async () => {
        try {
            exportDocxBtn.textContent = 'Loading DOCX Export...';
            exportDocxBtn.disabled = true;

            if (!docxGenerator) {
                const module = await import('./docx-generator.js');
                docxGenerator = new module.DOCXGenerator();
            }

            const headerText = headerInput.value.trim();
            const footerText = footerInput.value.trim();
            const includePageNumbers = pageNumbersCheckbox.checked;
            const filename = getEffectiveFilename('.docx');

            docxGenerator.setOptions(headerText, footerText, includePageNumbers);
            await docxGenerator.generateDOCX(previewContent, filename);
        } catch (error) {
            console.error('Failed to load DOCX generator:', error);
            alert('Failed to load DOCX export functionality. Please refresh and try again.');
        } finally {
            exportDocxBtn.textContent = 'Export DOCX (BETA)';
            exportDocxBtn.disabled = false;
        }
    });

    // Export MHTML - Lazy load on click
    exportMhtmlBtn.addEventListener('click', async () => {
        try {
            exportMhtmlBtn.textContent = 'Loading MHTML Export...';
            exportMhtmlBtn.disabled = true;

            if (!mhtmlGenerator) {
                const module = await import('./mhtml-generator.js');
                mhtmlGenerator = new module.MHTMLGenerator();
            }

            const filename = getEffectiveFilename('.mht');
            await mhtmlGenerator.generateMHTML(previewContent, filename);
        } catch (error) {
            console.error('Failed to load MHTML generator:', error);
            alert('Failed to load MHTML export functionality. Please refresh and try again.');
        } finally {
            exportMhtmlBtn.textContent = 'Export MHTML';
            exportMhtmlBtn.disabled = false;
        }
    });

    // Print PDF (text-searchable)
    printBtn.addEventListener('click', () => {
        updatePrintOptions();
        window.print();
    });

    // Update print options when inputs change
    headerInput.addEventListener('input', updatePrintOptions);
    footerInput.addEventListener('input', updatePrintOptions);
    pageNumbersCheckbox.addEventListener('change', updatePrintOptions);
    linkUrlsCheckbox.addEventListener('change', updatePrintOptions);

    // Update styling options when inputs change
    wordHeadersCheckbox.addEventListener('change', updateStylingOptions);
    fontSelect.addEventListener('change', updateStylingOptions);

    // Help modal event listeners
    if (helpBtn && helpModal && helpClose) {
        helpBtn.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });

        helpClose.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });

        // Close modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }

    // Input event listener with debouncing (for diagram rendering performance)
    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updatePreview().catch(err => {
                console.error('Debounced preview error:', err);
            });
        }, 300); // Wait 300ms after user stops typing
    });

    // Initial render
    updatePreview();
    updatePrintOptions();
    updateStylingOptions();
});
