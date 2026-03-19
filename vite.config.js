import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        [env.VITE_API_PREFIX]: {
          // target: 'http://127.0.0.1:12600/',
          target: 'http://113.45.133.164:12600/',
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop() || ''
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
              return 'img/[name]-[hash].[ext]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return 'fonts/[name]-[hash].[ext]'
            }
            if (ext === 'css') {
              return 'css/[name]-[hash].[ext]'
            }
            return '[name]-[hash].[ext]'
          }
        }
      }
    }
  }
})
