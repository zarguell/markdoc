import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Check if we're building for single file distribution
const isSingleFile = process.env.BUILD_SINGLE_FILE === 'true';

export default defineConfig({
  plugins: [
    isSingleFile ? viteSingleFile() : null
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: isSingleFile ? 100000000 : 4096,
    codeSplitting: isSingleFile ? false : undefined,
    rollupOptions: {
      output: {
        manualChunks: isSingleFile ? undefined : (id) => {
          if (id.includes('node_modules/marked')) return 'marked';
          if (id.includes('node_modules/html2pdf.js') || id.includes('node_modules/html2canvas')) return 'pdf-export';
          if (id.includes('node_modules/docshift')) return 'docx-export';
          if (id.includes('node_modules/mermaid')) return 'mermaid-core';
          if (id.includes('node_modules/@viz-js/viz')) return 'viz-renderer';
          if (id.includes('node_modules/nomnoml')) return 'nomnoml';
          if (id.includes('node_modules/pikchr-js')) return 'pikchr';
        }
      }
    }
  }
});
