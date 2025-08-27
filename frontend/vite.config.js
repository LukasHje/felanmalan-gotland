import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxyar /api till din backend i DEV.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.0.42:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
