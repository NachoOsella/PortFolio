import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Production builds must target the real API. Without VITE_API_URL the app
  // would silently fall back to the localStorage mock Studio, which must never
  // reach production.
  if (mode === 'production') {
    const env = loadEnv(mode, rootDirectory, '');
    if (!env.VITE_API_URL) {
      throw new Error(
        'VITE_API_URL is required for production builds. Set it (e.g. VITE_API_URL=/api) so the app targets the Spring Boot backend instead of the local mock.',
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(rootDirectory, './src') } },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-motion': ['motion'],
            'vendor-carousel': ['embla-carousel-react'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      globals: true,
    },
  };
});
