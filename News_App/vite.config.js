import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path based on environment
  const isProduction = mode === 'production'
  const basePath = isProduction ? '/news/' : '/'
  
  return {
    plugins: [react()],
    base: basePath,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
        }
      },
      // Ensure assets are properly handled
      assetsInlineLimit: 0
    },
    server: {
      historyApiFallback: {
        index: '/index.html'
      },
    },
    preview: {
      port: 4173,
      historyApiFallback: {
        index: '/index.html'
      },
    }
  }
})
