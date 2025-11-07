import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  esbuild: {
    // TEMPORARILY DISABLED FOR DEBUGGING: drop: ['console', 'debugger'], // Drop all console calls and debuggers in production
  },
  build: {
    // Increase chunk size warning limit to 1000 kB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Smart automatic chunking based on module paths
        manualChunks(id) {
          // CRITICAL: Keep React core together with all node_modules
          // This prevents "Cannot read properties of undefined (reading 'createContext')" error
          if (id.includes('node_modules')) {
            return 'vendor-utils';
          }
          
          // Group individual user pages
          if (id.includes('/pages/users/individual/')) {
            return 'individual-pages';
          }
          
          // Group vendor pages
          if (id.includes('/pages/users/vendor/')) {
            return 'vendor-pages';
          }
          
          // Group admin pages
          if (id.includes('/pages/users/admin/')) {
            return 'admin-pages';
          }
          
          // Group coordinator pages
          if (id.includes('/pages/users/coordinator/')) {
            return 'coordinator-pages';
          }
          
          // Group shared components (modals, headers, etc.)
          if (id.includes('/shared/components/')) {
            return 'shared-components';
          }
        },
        // Naming pattern for chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        // Naming for entry chunks
        entryFileNames: 'assets/[name]-[hash].js',
        // Naming for asset files
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize build performance
    sourcemap: false, // Disable sourcemaps in production for smaller builds
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'es2015', // Support modern browsers
  },
  server: {
    host: true, // Always expose to network
    port: 5173, // Fixed port for consistency
    strictPort: false, // Allow fallback to other ports if 5173 is busy
    // TEMPORARILY DISABLED: Proxy that might be interfering with booking requests
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  }
})
