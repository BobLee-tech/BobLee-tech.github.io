import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// base "./" 让构建产物在任意子路径（如 GitHub Pages 的 /仓库名/）下都能正常加载
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 700 },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
