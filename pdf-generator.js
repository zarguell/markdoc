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

    generatePDF(element) {
        const opt = {
            margin: [0.4, 0.4, 0.4, 0.4], // top, right, bottom, left
            filename: 'markdoc-document.pdf',
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

                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);

                    // Header
                    if (this.headerText) {
                        pdf.setFontSize(10);
                        pdf.text(this.headerText, margin, margin - 0.1);
                    }

                    // Footer
                    if (this.footerText) {
                        pdf.setFontSize(10);
                        pdf.text(this.footerText, margin, pageHeight - margin + 0.1);
                    }

                    // Page numbers
                    if (this.includePageNumbers) {
                        pdf.setFontSize(10);
                        const pageNumber = `Page ${i}`;
                        const textWidth = pdf.getTextWidth(pageNumber);
                        pdf.text(pageNumber, pageWidth - margin - textWidth, pageHeight - margin + 0.1);
                    }
                }

                pdf.save('markdoc-document.pdf');
            })
            .catch((err) => {
                console.error('PDF Generation Error:', err);
                alert('Failed to generate PDF. Check console for details.');
            });
    }
}

// Export for use in app.js
window.PDFGenerator = PDFGenerator;
