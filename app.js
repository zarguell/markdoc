// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdown-input');
    const previewContent = document.getElementById('preview-content');
    const exportBtn = document.getElementById('export-btn');
    const optionsToggle = document.getElementById('options-toggle');
    const optionsPanel = document.getElementById('options-panel');
    const headerInput = document.getElementById('header-input');
    const footerInput = document.getElementById('footer-input');
    const pageNumbersCheckbox = document.getElementById('page-numbers-checkbox');

    // Initialize PDF Generator
    const pdfGenerator = new PDFGenerator();

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

    // Export PDF with options
    exportBtn.addEventListener('click', () => {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;

        pdfGenerator.setOptions(headerText, footerText, includePageNumbers);
        pdfGenerator.generatePDF(previewContent);
    });

    // Input event listener
    input.addEventListener('input', updatePreview);

    // Initial render
    updatePreview();
});
