import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the site live under a sub-path, e.g. GitHub Pages: BASE_PATH=/pm-path/ npm run build
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'PM Path',
        short_name: 'PM Path',
        description: 'A free 14-week plan to become an APM, PM or AI PM: lessons, tools, templates, interview prep and progress tracking.',
        theme_color: '#FFF8EE',
        background_color: '#FFF8EE',
        display: 'standalone',
        start_url: `${base}dashboard`,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        // Firebase is only needed by people who sign in, so it is cached on first use instead of pre-downloaded.
        globIgnores: ['**/firebaseBackend-*.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/assets\/firebaseBackend-.*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'pm-path-firebase', expiration: { maxEntries: 4 } },
          },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom', globals: true },
  build: { chunkSizeWarningLimit: 900 },
});
