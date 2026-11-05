import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'data/processed/*.geojson'],
      manifest: {
        name: 'SI-BAHARI 3D — Digital Twin Kota Tegal',
        short_name: 'SI-BAHARI 3D',
        description: 'Sistem Informasi Banjir Rob, Amblesan Tanah & Hidrologi Pesisir Kota Tegal',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('maplibre-gl')) {
            return 'maplibre';
          }
        }
      }
    }
  },
  server: {
    port: 8000,
    open: false
  }
});
