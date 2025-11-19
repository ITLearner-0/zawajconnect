import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/", // Use absolute paths from root to fix routing issues
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize asset handling for better caching
    rollupOptions: {
      output: {
        // Create separate chunks for better caching and parallel loading
        manualChunks: (id) => {
          // Core dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('zod')) {
              return 'vendor-validation';
            }
            if (id.includes('recharts') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            // All other node_modules
            return 'vendor';
          }

          // Separate large feature chunks
          if (id.includes('/pages/')) {
            const page = id.split('/pages/')[1]?.split('.')[0];
            // Group smaller pages together
            if (['FAQ', 'Privacy', 'Settings', 'Guidance'].some(p => id.includes(p))) {
              return 'pages-small';
            }
            return `page-${page}`;
          }

          // Keep components together by feature
          if (id.includes('/components/')) {
            if (id.includes('/components/ui/')) {
              return 'components-ui';
            }
            if (id.includes('/components/enhanced/')) {
              return 'components-enhanced';
            }
            if (id.includes('/components/matching/')) {
              return 'components-matching';
            }
            if (id.includes('/components/security/')) {
              return 'components-security';
            }
          }
        },
        // Ensure consistent hash-based filenames for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize for modern browsers (ES2020 for better code)
    target: 'es2020',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true, // Safe now with our logger system
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // More aggressive compression
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove all comments
      },
    } : undefined,
    // Source maps only in development
    sourcemap: mode === 'development' ? 'inline' : false,
    // Asset size warnings
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Report compressed size (slower but useful)
    reportCompressedSize: true,
  },
}));
