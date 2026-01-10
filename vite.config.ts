/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
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
    setupFiles: ["./src/setup-tests.ts"],
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.config.ts", "**/main.ts"],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
