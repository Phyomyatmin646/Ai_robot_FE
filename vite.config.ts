import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || 'https://107.23.154.150.sslip.io';

  return {
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
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            origin: 'http://localhost:5173',
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('origin', 'http://localhost:5173');
            });
            proxy.on('error', (err, _req, res) => {
              console.error('[Vite Proxy Error]:', err.message);
              if ('writeHead' in res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: { message: `Vite Proxy Error: ${err.message}` } }));
              }
            });
          },
        },
        '/health': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', () => {
              // Suppress terminal ECONNREFUSED logs when backend is offline
            });
          },
        },
        '/socket.io': {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
          secure: false,
          headers: {
            origin: 'http://localhost:5173',
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('origin', 'http://localhost:5173');
            });
            proxy.on('error', () => {
              // Suppress terminal ECONNREFUSED logs when backend is offline
            });
          },
        },
        '/ws': {
          target: backendTarget,
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
  };
});
