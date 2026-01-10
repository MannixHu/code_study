/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "MeFlow3 - React 学习平台",
        short_name: "MeFlow3",
        description: "交互式 React 学习体验平台",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
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
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Pre-cache app shell
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      devOptions: {
        enabled: false, // Disable PWA in development
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // 为浏览器环境定义 process.env.NODE_ENV
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
    "process.platform": JSON.stringify(""),
    "process.version": JSON.stringify(""),
  },
  optimizeDeps: {
    // 确保 Babel 相关依赖被正确预构建
    include: ["@babel/parser", "@babel/traverse"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React核心库
          "vendor-react": ["react", "react-dom"],
          // UI组件库
          "vendor-antd": ["antd", "@ant-design/icons"],
          // 代码编辑器
          "vendor-monaco": ["@monaco-editor/react"],
          // 状态管理
          "vendor-zustand": ["zustand"],
          // Babel工具 (用于代码分析)
          "vendor-babel": ["@babel/parser", "@babel/traverse"],
          // 数据库
          "vendor-dexie": ["dexie"],
        },
      },
    },
    // 设置chunk大小警告阈值为1MB
    chunkSizeWarningLimit: 1000,
  },
  test: {
    // Vitest configuration
    globals: true,
    environment: "happy-dom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.config.ts", "**/main.ts"],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
