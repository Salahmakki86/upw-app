import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'حرر قوتك — UPW',
        short_name: 'حرر قوتك',
        description: 'تطبيق يومي لتطبيق مفاهيم Unleash the Power Within لتوني روبنز',
        start_url: '/',
        display: 'standalone',
        background_color: '#090909',
        theme_color: '#090909',
        orientation: 'portrait',
        lang: 'ar',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        importScripts: ['push-handler.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', cacheableResponse: { statuses: [0, 200] } }
          },
        ],
      },
    }),
  ],
})
