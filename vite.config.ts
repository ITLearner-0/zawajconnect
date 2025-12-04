import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Sentry plugin for source maps upload in production
    mode === 'production' && process.env.VITE_SENTRY_DSN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/assets/**',
        filesToDeleteAfterUpload: ['./dist/assets/**/*.map'],
      },
      telemetry: false,
    }),
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
    // Disable JS minification in production to avoid rare TDZ/runtime issues
    // Once everything is stable in production, we can reintroduce minification
    // using esbuild or safer settings.
    minify: false,
    terserOptions: undefined,
    // Enable source maps in production for Sentry (will be uploaded then deleted)
    // Only inline in development for faster debugging
    sourcemap: mode === 'development' ? 'inline' : 'hidden',
    // Asset size warnings
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Report compressed size (slower but useful)
    reportCompressedSize: true,
  },
}));
