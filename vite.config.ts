import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — production-hardened.
 *
 * The `define` block that injected GEMINI_API_KEY directly into the client
 * bundle has been removed. The key now lives only in the Vercel serverless
 * function (api/generate.ts) and is never sent to the browser.
 *
 * OWASP A02: Cryptographic Failures / Secrets Exposure — fixed.
 */
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
