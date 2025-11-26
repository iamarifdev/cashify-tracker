import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      base: mode === 'production' ? '/' : '/',
      build: {
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        }
      },
      css: {
        devSourcemap: true,
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@/features': path.resolve(__dirname, './src/features'),
          '@/shared': path.resolve(__dirname, './src/shared'),
          '@/pages': path.resolve(__dirname, './src/pages'),
          '@/types': path.resolve(__dirname, './src/types'),
          '@/utils': path.resolve(__dirname, './src/utils'),
          '@/hooks': path.resolve(__dirname, './src/hooks'),
          '@/assets': path.resolve(__dirname, './src/assets'),
          '@/services': path.resolve(__dirname, './src/services'),
        }
      }
    };
});
