import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'marked': ['marked'],
          'pdf-export': ['html2pdf.js', 'html2canvas'],
          'docx-export': ['docshift'],
          'mermaid-core': ['mermaid'],
          'viz-renderer': ['@viz-js/viz'],
          'nomnoml': ['nomnoml'],
          'pikchr': ['pikchr-js'],
        }
      }
    }
  }
});
