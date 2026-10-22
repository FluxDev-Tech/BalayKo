
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  server: {
    // Preserve the existing HMR behavior.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Disable file watching when requested.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
