import { defineConfig } from 'vite';
export default defineConfig({
  base: '/campaign-region/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
