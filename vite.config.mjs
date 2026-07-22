import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  assetsInclude: ['**/*.glb'],
  plugins: [react()],
  build: {
    outDir: 'assets/lanyard-build',
    emptyOutDir: true,
    lib: {
      entry: 'src/lanyard-main.jsx',
      formats: ['es'],
      fileName: () => 'lanyard.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    }
  }
});
