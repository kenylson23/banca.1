import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    // Only enable these plugins in development mode on Replit
    ...(process.env.NODE_ENV === "development" &&
    process.env.REPL_ID !== undefined
      ? [
          runtimeErrorOverlay(),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks - simplificado para reduzir uso de memória
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            // Agrupar outros vendors
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    minify: 'esbuild', // esbuild é mais rápido e usa menos memória que terser
  },
  server: {
    // Desabilita cache em desenvolvimento
    headers: {
      'Cache-Control': 'no-store',
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
