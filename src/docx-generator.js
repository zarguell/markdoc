class DOCXGenerator {
    constructor() {
        // Options for headers/footers/page numbers
        this.headerText = '';
        this.footerText = '';
        this.includePageNumbers = false;

        // Tighter, more control-focused spacing
        this.styles = {
            'body': 'font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.15; color: #000000; margin: 0; padding: 0;',
            
            // Headings: Tight spacing, no extra margins
            'h1': 'font-size: 28pt; margin: 12pt 0 6pt 0; font-weight: bold; page-break-after: avoid; color: #2E74B5;',
            'h2': 'font-size: 22pt; margin: 10pt 0 4pt 0; font-weight: bold; page-break-after: avoid; color: #2E74B5;',
            'h3': 'font-size: 16pt; margin: 8pt 0 2pt 0; font-weight: bold; page-break-after: avoid; color: #1F4D78;',
            
            // Paragraphs: Standard spacing
            'p': 'margin: 0 0 6pt 0; line-height: 1.15; orphans: 2; widows: 2;',
            
            // Lists: Compact
            'ul': 'margin: 6pt 0 6pt 20pt; padding: 0; line-height: 1.15;',
            'ol': 'margin: 6pt 0 6pt 20pt; padding: 0; line-height: 1.15;',
            'li': 'margin: 0 0 3pt 0; line-height: 1.15;',
            
            // Code blocks
            'code': 'font-family: "Courier New", monospace; background-color: #f3f3f3; padding: 1pt 3pt; font-size: 10pt;',
            'pre': 'background-color: #f3f3f3; padding: 8pt; border: 1pt solid #ddd; margin: 6pt 0; white-space: pre-wrap; font-family: "Courier New", monospace; font-size: 9pt; line-height: 1.1;',
            
            // Block quotes
            'blockquote': 'border-left: 3pt solid #cccccc; margin: 6pt 0; padding: 0 0 0 10pt; color: #666666; font-style: italic; line-height: 1.15;',
            
            // Tables
            'table': 'border-collapse: collapse; width: 100%; margin: 6pt 0; border: 1pt solid #999;',
            'th': 'border: 1pt solid #999; padding: 4pt; background-color: #e7e6e6; font-weight: bold; text-align: left; font-size: 10pt;',
            'td': 'border: 1pt solid #999; padding: 4pt; vertical-align: top; font-size: 10pt;',
            
            // Links
            'a': 'color: #0563c1; text-decoration: underline;'
        };
    }

    setOptions(headerText, footerText, includePageNumbers) {
        this.headerText = headerText;
        this.footerText = footerText;
        this.includePageNumbers = includePageNumbers;
    }

    async generateDOCX(element, filename = 'markdoc-document.docx') {
        try {
            const container = document.createElement('div');
            container.innerHTML = element.innerHTML;

            // Apply inline styles
            this.applyInlineStyles(container);
            
            // Normalize spacing (strip excessive margins from markdown output)
            this.normalizeSpacing(container);

            // Process images
            await this.processImages(container);

            // Note: True DOCX headers/footers with page numbers require special handling
            // For now, we'll add them as content with Word-compatible page break instructions

            let headerContent = '';
            let footerContent = '';

            if (this.headerText) {
                // Use CSS that Word should interpret for headers
                headerContent = `
                    <div style="mso-element: header;" id="header">
                        <p style="text-align: center; font-size: 10pt; margin: 0; color: #666666; border-bottom: 1pt solid #cccccc; padding-bottom: 6pt;">
                            ${this.headerText}
                        </p>
                    </div>
                `;
            }

            if (this.footerText || this.includePageNumbers) {
                let footerText = '';
                if (this.footerText) {
                    footerText += this.footerText;
                }
                if (this.includePageNumbers) {
                    footerText += (this.footerText ? ' | ' : '') + '<span style="mso-field-code: PAGE"></span> of <span style="mso-field-code: NUMPAGES"></span>';
                }

                footerContent = `
                    <div style="mso-element: footer;" id="footer">
                        <p style="text-align: center; font-size: 10pt; margin: 0; color: #666666; border-top: 1pt solid #cccccc; padding-top: 6pt;">
                            ${footerText}
                        </p>
                    </div>
                `;
            }

            const finalHTML = `
                <!DOCTYPE html>
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
                <head>
                    <meta charset="utf-8">
                    <title>Document</title>
                    <style>
                        @page {
                            margin: 1in 0.75in 1.25in 0.75in;
                        }
                    </style>
                    <!--[if gte mso 9]><xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>0</w:Zoom>
                            <w:DoNotPromoteQF/>
                            <w:DoNotDemoteQF/>
                        </w:WordDocument>
                    </xml><![endif]-->
                </head>
                <body style="${this.styles['body']}">
                    ${headerContent}
                    ${container.innerHTML}
                    ${footerContent}
                </body>
                </html>
            `;

            const docxBlob = await window.docshift.toDocx(finalHTML);
            this.downloadBlob(docxBlob, filename);

        } catch (error) {
            console.error('DOCX Generation Error:', error);
            alert('Failed: ' + error.message);
        }
    }

    // NEW: Remove excessive margins that markdown adds
    normalizeSpacing(container) {
        // Target common problematic selectors
        const elements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre');
        
        elements.forEach(el => {
            // Strip dangerous margin-bottom values (often 16pt+ from markdown)
            const style = el.getAttribute('style') || '';
            
            // Remove old-school margin values that are too large
            let cleaned = style
                .replace(/margin(-bottom)?:\s*\d+(pt|px|em|rem);?/gi, '')
                .replace(/margin-top:\s*\d+(pt|px|em|rem);?/gi, '');
            
            el.setAttribute('style', cleaned.trim());
        });

        // Also collapse consecutive empty paragraphs
        const pElements = container.querySelectorAll('p');
        let prevWasEmpty = false;
        pElements.forEach(p => {
            const isEmpty = !p.textContent.trim();
            if (isEmpty && prevWasEmpty) {
                p.style.display = 'none'; // Hide duplicate empty paragraphs
            }
            prevWasEmpty = isEmpty;
        });
    }

    applyInlineStyles(container) {
        Object.keys(this.styles).forEach(selector => {
            if (selector === 'body') return;
            
            const elements = container.querySelectorAll(selector);
            elements.forEach(el => {
                const currentStyle = el.getAttribute('style') || '';
                const newStyle = this.styles[selector];
                el.setAttribute('style', `${newStyle} ${currentStyle}`);
            });
        });

        const pageBreaks = container.querySelectorAll('.page-break');
        pageBreaks.forEach(el => {
            el.style.pageBreakBefore = 'always';
            el.style.display = 'block';
        });
    }

    async processImages(container) {
        const images = container.querySelectorAll('img');
        const promises = Array.from(images).map(async (img) => {
            if (!img.src.startsWith('data:')) {
                try {
                    const base64 = await this.convertImageToBase64(img.src);
                    img.src = base64;
                    if (!img.style.width) img.style.maxWidth = '100%';
                } catch (error) {
                    console.warn('Image skip:', error);
                }
            }
        });
        await Promise.all(promises);
    }

    async convertImageToBase64(imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

window.DOCXGenerator = DOCXGenerator;
