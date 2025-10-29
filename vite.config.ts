import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // TEMPORARILY DISABLED FOR DEBUGGING: drop: ['console', 'debugger'], // Drop all console calls and debuggers in production
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
