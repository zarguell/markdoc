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

    // Initialize PDF Generator
    const pdfGenerator = new PDFGenerator();

    // Initialize DOCX Generator
    const docxGenerator = new DOCXGenerator();

    // Initialize MHTML Generator
    const mhtmlGenerator = new MHTMLGenerator();

    // Default markdown text
    const defaultText = `# Welcome to Markdoc

Markdoc is a simple markdown to PDF converter that generates high-quality documents.

## Features

- Live preview of your markdown
- Custom headers and footers
- Page numbering support
- Clean, professional PDF output

\`\`\`javascript
// Example code block
function hello() {
    console.log('Hello, Markdoc!');
}
\`\`\`

> This is a blockquote example.
`;
    input.value = defaultText;

    // Update preview function
    function updatePreview() {
        const text = input.value;
        previewContent.innerHTML = marked.parse(text);
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

    // Export PDF with options
    exportBtn.addEventListener('click', () => {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;

        pdfGenerator.setOptions(headerText, footerText, includePageNumbers);
        pdfGenerator.generatePDF(previewContent);
    });

    // Export DOCX
    exportDocxBtn.addEventListener('click', async () => {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;

        docxGenerator.setOptions(headerText, footerText, includePageNumbers);
        await docxGenerator.generateDOCX(previewContent);
    });

    // Export MHTML
    exportMhtmlBtn.addEventListener('click', async () => {
        await mhtmlGenerator.generateMHTML(previewContent);
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

    // Input event listener
    input.addEventListener('input', updatePreview);

    // Initial render
    updatePreview();
    updatePrintOptions();
    updateStylingOptions();
});
