import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
          // Separate React and core dependencies
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Separate Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
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
          
          // Group all other node_modules together
          if (id.includes('node_modules')) {
            return 'vendor-utils';
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
