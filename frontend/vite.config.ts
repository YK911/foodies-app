import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), svgr()],
  // Для деплою на GitHub Pages: назва вашого репозиторію
  base: command === 'build' ? '/foodies-app/' : '/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
}));
