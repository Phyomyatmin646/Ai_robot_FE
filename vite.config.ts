import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://107.23.154.150.sslip.io',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Suppress terminal ECONNREFUSED logs when backend is offline
          });
        },
      },
      '/health': {
        target: process.env.VITE_BACKEND_URL || 'https://107.23.154.150.sslip.io',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Suppress terminal ECONNREFUSED logs when backend is offline
          });
        },
      },
      '/socket.io': {
        target: process.env.VITE_BACKEND_URL || 'https://107.23.154.150.sslip.io',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Suppress terminal ECONNREFUSED logs when backend is offline
          });
        },
      },
    },
  },
});
