import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
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
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
              return 'date';
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            // Outros vendors em chunk separado
            return 'vendor';
          }
          
          // Separar componentes pesados do dashboard
          if (id.includes('components/modern-chart') || 
              id.includes('components/data-heatmap') ||
              id.includes('components/advanced-sales-chart')) {
            return 'dashboard-charts';
          }
          
          if (id.includes('components/activity-feed') ||
              id.includes('components/goals-widget') ||
              id.includes('components/quick-actions-widget')) {
            return 'dashboard-widgets';
          }
          
          if (id.includes('components/ui/')) {
            return 'ui-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    sourcemap: false, // Desabilita sourcemaps em produção para reduzir tamanho
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
      },
    },
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
