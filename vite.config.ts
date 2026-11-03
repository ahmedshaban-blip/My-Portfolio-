import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // OPTIMIZE: keep initial JS parse small + long-term caching per vendor.
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          // PERFORMANCE: clsx / tailwind-merge / cva are needed by the entry
          // above the fold; keep them in their own small chunk so the entry
          // doesn't drag the admin/projects-only Radix primitives with it.
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
}));
