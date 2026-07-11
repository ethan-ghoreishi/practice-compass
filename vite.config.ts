/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Human-readable build stamp shown in Settings and used to confirm which
// version an installed PWA is actually running.
function buildVersion(): string {
  let sha = 'dev';
  try {
    sha = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    /* no git in some environments */
  }
  return `${new Date().toISOString().slice(0, 10)}·${sha}`;
}

// Served from GitHub Pages at /practice-compass/ (deploy.yml). Override with
// PC_BASE=/ if it ever moves to its own host.
const prodBase = process.env.PC_BASE ?? '/practice-compass/';

// Restrictive CSP for the published app (Pages can't set headers, so it ships
// as a meta tag): no third-party scripts/styles/frames; network access only
// to same-origin assets and the GitHub API for sync. Build-only — the dev
// server needs its own inline preamble.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self' https://api.github.com",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
].join('; ');

function cspPlugin() {
  return {
    name: 'inject-csp',
    apply: 'build' as const,
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend' as const,
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // `vite preview` serves the PRODUCTION build — it must use the prod base.
  base: command === 'build' || isPreview ? prodBase : '/',
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion()),
  },
  plugins: [
    react(),
    cspPlugin(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Practice Compass',
        short_name: 'Compass',
        description:
          'A calm, local-first music practice tracker. One item, one focus — and a path you can trust.',
        theme_color: '#16181d',
        background_color: '#16181d',
        display: 'standalone',
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
