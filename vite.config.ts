import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    // Drop console.log ONLY in production builds
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Production optimizations
    minify: 'esbuild', // Fast minification with esbuild
    target: 'es2015', // Browser compatibility
    cssCodeSplit: true, // Split CSS for better caching
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase
          'firebase': ['firebase/app', 'firebase/auth'],
          // UI libraries
          'lucide': ['lucide-react'],
        },
        // Better asset naming for caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb
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
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
}))
