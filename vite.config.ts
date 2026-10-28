import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
      '/sitemap.xml': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/llms.txt': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/llms-full.txt': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/llm.txt': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-helmet-async': path.resolve(__dirname, 'lib/helmet.tsx'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-helmet')) {
              return 'vendor-react';
            }
            if (id.includes('three')) {
              return 'vendor-three';
            }
            if (id.includes('mapbox-gl')) {
              return 'vendor-mapbox';
            }
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            if (id.includes('leaflet') || id.includes('osmtogeojson')) {
              return 'vendor-leaflet';
            }
            if (id.includes('motion') || id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-motion';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('dompurify')) {
              return 'vendor-purify';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-ai';
            }
          }
        },
      },
    },
  },
});
