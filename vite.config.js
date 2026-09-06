import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Điểm Danh Đoàn Sinh",
        short_name: "Điểm Danh",
        description: "Ứng dụng quản lý điểm danh đoàn sinh",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "@reduxjs/toolkit", "react-redux"],
          "vendor-ui": ["lucide-react", "clsx", "tailwind-merge"],
          "vendor-3d": ["three", "@react-three/fiber", "@react-three/drei"],
          "vendor-docs": ["xlsx", "jspdf", "jspdf-autotable", "pdfmake"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
