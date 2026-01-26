// Import html2pdf and html2canvas
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

// PDF Generation Module
class PDFGenerator {
    constructor() {
        this.headerText = '';
        this.footerText = '';
        this.includePageNumbers = false;
    }

    setOptions(headerText, footerText, includePageNumbers) {
        this.headerText = headerText;
        this.footerText = footerText;
        this.includePageNumbers = includePageNumbers;
    }

    generatePDF(element, filename = 'browsermark-document.pdf') {
        const opt = {
            margin: [0.5, 0.4, 0.8, 0.4], // top, right, bottom, left - increased top to prevent clipping on page breaks
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                // pdf is the jsPDF instance
                const pageCount = pdf.internal.getNumberOfPages();
                const pageWidth = pdf.internal.pageSize.width;
                const pageHeight = pdf.internal.pageSize.height;
                const margin = 0.4; // inch
                const footerMargin = 0.8; // bottom margin reserved for footer/page numbers

                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);

                    // Header
                    if (this.headerText) {
                        pdf.setFontSize(10);
                        pdf.text(this.headerText, margin, margin - 0.1);
                    }

                    // Footer with text wrapping
                    if (this.footerText) {
                        pdf.setFontSize(10);
                        const maxFooterWidth = pageWidth - (2 * margin) - 0.75; // Reserve 0.75" on right for page numbers
                        const splitFooter = pdf.splitTextToSize(this.footerText, maxFooterWidth);
                        
                        // Position footer starting from bottom, moving up for wrapped lines
                        const lineHeight = 0.15; // inch
                        const footerStartY = pageHeight - footerMargin + (splitFooter.length - 1) * lineHeight;
                        
                        pdf.text(splitFooter, margin, footerStartY);
                    }

                    // Page numbers (positioned right, above footer space)
                    if (this.includePageNumbers) {
                        pdf.setFontSize(10);
                        const pageNumber = `Page ${i}`;
                        const textWidth = pdf.getTextWidth(pageNumber);
                        pdf.text(pageNumber, pageWidth - margin - textWidth, pageHeight - margin + 0.1);
                    }
                }

                pdf.save(filename);
            })
            .catch((err) => {
                console.error('PDF Generation Error:', err);
                alert('Failed to generate PDF. Check console for details.');
            });
    }
}

// Export for use in app.js
export { PDFGenerator };
