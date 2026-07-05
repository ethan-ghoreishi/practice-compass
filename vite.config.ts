/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from the Synology Web Station `web` share as /practice-compass/
// (private, over Tailscale — this app holds personal practice data + your
// teacher's files). Override with PC_BASE=/ if it ever moves to its own host.
const prodBase = process.env.PC_BASE ?? '/practice-compass/';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? prodBase : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Practice Compass',
        short_name: 'Compass',
        description:
          'A calm, local-first music practice tracker. One item, one focus — and a path you can trust.',
        theme_color: '#16181d',
        background_color: '#16181d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
