// MHTML Generation Module
class MHTMLGenerator {
    constructor() {
        this.styles = {
            'body': 'font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.15; color: #000000; margin: 0; padding: 0;',

            // Headings
            'h1': 'font-size: 28pt; margin: 12pt 0 6pt 0; font-weight: bold; page-break-after: avoid; color: #2E74B5;',
            'h2': 'font-size: 22pt; margin: 10pt 0 4pt 0; font-weight: bold; page-break-after: avoid; color: #2E74B5;',
            'h3': 'font-size: 16pt; margin: 8pt 0 2pt 0; font-weight: bold; page-break-after: avoid; color: #1F4D78;',

            // Paragraphs
            'p': 'margin: 0 0 6pt 0; line-height: 1.15;',

            // Lists
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

    async generateMHTML(element, filename = 'markdoc-document.mht') {
        try {
            const container = document.createElement('div');
            container.innerHTML = element.innerHTML;

            // Apply inline styles
            this.applyInlineStyles(container);

            // Process images and collect them
            const images = await this.processImages(container);

            // Get the final HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Document</title>
                    <style>
                        body { margin: 1in; }
                    </style>
                </head>
                <body>
                    ${container.innerHTML}
                </body>
                </html>
            `;

            // Generate and download MHTML
            this.downloadMHTML(htmlContent, images, filename);

        } catch (error) {
            console.error('MHTML Generation Error:', error);
            alert('Failed to generate MHTML. Check console for details.');
        }
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
    }

    async processImages(container) {
        const images = [];
        const imgElements = container.querySelectorAll('img');
        let imageCounter = 1;

        for (const img of imgElements) {
            const src = img.src;
            let imageData = null;
            let mimeType = '';
            let location = '';

            if (src.startsWith('data:')) {
                // Extract MIME type and base64 data
                const match = src.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    mimeType = match[1];
                    imageData = match[2];
                    location = `image${imageCounter}.${mimeType.split('/')[1]}`;
                    img.src = location;
                    imageCounter++;
                }
            } else {
                // For external images, fetch and convert (though unlikely in this app)
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();
                    mimeType = blob.type;
                    imageData = await this.blobToBase64(blob);
                    location = `image${imageCounter}.${mimeType.split('/')[1]}`;
                    img.src = location;
                    imageCounter++;
                } catch (error) {
                    console.warn('Failed to process image:', src, error);
                    continue;
                }
            }

            if (imageData && mimeType) {
                images.push({
                    type: mimeType,
                    data: imageData,
                    location: location
                });
            }
        }

        return images;
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    downloadMHTML(htmlContent, images = [], filename = 'document.mht') {
        const boundary = "----=_NextPart_000_0000_01D9";
        
        // Helper to handle UTF-8 strings for Base64
        const toBase64 = (str) => {
            return window.btoa(unescape(encodeURIComponent(str)));
        };

        // 1. Construct the Main Header
        // Note: MIME requires \r\n (CRLF) for all line breaks
        let mhtml = `MIME-Version: 1.0\r\n`;
        mhtml += `Content-Type: multipart/related; boundary="${boundary}"\r\n`;
        mhtml += `Snapshot-Content-Location: file:///C:/fake/document.html\r\n`;
        mhtml += `\r\n`; // End of main headers

        // 2. Add Preamble (Required for some strict parsers)
        mhtml += `This is a multi-part message in MIME format.\r\n`;
        mhtml += `\r\n`;

        // 3. Add the HTML Part
        mhtml += `--${boundary}\r\n`;
        mhtml += `Content-Type: text/html; charset="utf-8"\r\n`;
        mhtml += `Content-Transfer-Encoding: base64\r\n`;
        mhtml += `Content-Location: file:///C:/fake/document.html\r\n`;
        mhtml += `\r\n`;
        
        // Encode HTML to Base64 to avoid line-length limits and char issues
        const b64Html = toBase64(htmlContent);
        // Split into 76-char lines (MIME standard best practice)
        mhtml += b64Html.match(/.{1,76}/g).join('\r\n'); 
        mhtml += `\r\n`;

        // 4. Add Image Parts
        images.forEach(img => {
            mhtml += `--${boundary}\r\n`;
            mhtml += `Content-Type: ${img.type}\r\n`;
            mhtml += `Content-Transfer-Encoding: base64\r\n`;
            mhtml += `Content-Location: ${img.location}\r\n`;
            mhtml += `\r\n`;
            // Ensure image data is split into lines too
            mhtml += img.data.match(/.{1,76}/g).join('\r\n');
            mhtml += `\r\n`;
        });

        // 5. Close the boundary
        mhtml += `--${boundary}--\r\n`;

        // Download
        const blob = new Blob([mhtml], { type: "application/x-mimearchive" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

}

// Export for use in app.js
window.MHTMLGenerator = MHTMLGenerator;
