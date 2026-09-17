import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    // Stamped in at build time so Settings can show which version is running.
    // Without it there is no way to answer "did the update actually arrive".
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      // Ship updates without Arran having to do anything: the new service
      // worker takes over as soon as it has downloaded.
      registerType: 'autoUpdate',
      // We register the worker ourselves in src/platform/appUpdate.ts so that
      // it can be told to go and check for a new version. Left to itself it
      // only ever checks on a page navigation, which an installed app sitting
      // in the app switcher may not do for days.
      injectRegister: null,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Simmer',
        short_name: 'Simmer',
        description: 'A cooking companion with labelled timers at its heart.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#16120f',
        theme_color: '#16120f',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
