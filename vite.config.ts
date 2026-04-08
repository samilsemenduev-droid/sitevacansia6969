import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** Только для локального `npm run dev`: прокси на Express API. На статическом деплое (Cloudflare Pages / Vercel static) не используется. */
  const apiPort = env.APP_PORT || env.PORT || '8787';

  return {
    // Явно корень сайта: иначе при неверном base ассеты уйдут по неверным URL → белый экран на Pages.
    base: '/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});