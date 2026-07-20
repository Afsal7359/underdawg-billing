import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend during development.
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // "prompt" (not autoUpdate): a new deploy downloads in the background and
      // WAITS — we then show an in-app "Update" button (UpdatePrompt.jsx) so the
      // cashier is never reloaded in the middle of a bill. The service worker is
      // registered by the useRegisterSW() hook, so we disable auto-injection.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["icons/apple-touch-icon.png", "logo.png"],
      manifest: {
        name: "underdawg Billing",
        short_name: "Billing",
        description: "Fast billing, barcode scanning, khata accounts and reports for your store.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F2F2F7",
        theme_color: "#F2F2F7",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        navigateFallback: "/index.html"
      }
    })
  ]
});
