import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: 'localhost',
    port: 5173,

    watch: {
      ignored: [
        '**/media.json',
        '**/text.json',
        '**/reviews.json',
        '**/demandesavis.json', // 👈 Prevents Vite from refreshing when this file updates
      ],
    },

    proxy: {
      '/api': {
        // Explicit 127.0.0.1 avoids Node 18+ IPv6 (::1) ECONNREFUSED mismatch
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/demandeavis': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});