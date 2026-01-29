import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig(({ mode }) => {
  const isLynn = mode === 'lynn'
  const isUat = mode === 'uat'
  // Route API via dev proxy per mode to avoid CORS during development
  const proxyTarget = isLynn
    ? 'http://localhost:10201'
    : isUat
      ? 'http://192.168.106.97:8880'
      : 'http://192.168.106.97:10200'

  return {
    base: './',
    build: {
      target: 'es2020', // 或 'esnext'
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('arcgis-'),
          },
        },
      }),
      VueSetupExtend(),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] }),
    ],
    server: {
      proxy: {
        '/codex-api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // 在 uat 模式下不重写，确保命中 Nginx 的 /codex-api/ 位置；
          // 在其他模式下将前缀改写为后端网关的 /api 前缀。
          rewrite: (path) => (isUat ? path : path.replace(/^\/codex-api/, '/api')),
        },
      },
    },
    optimizeDeps: {
      include: ['schart.js'],
      exclude: ['@arcgis/core', '@arcgis/map-components'],
      esbuildOptions: {
        target: 'esnext',
        supported: {
          bigint: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
        '~': '/src/assets',
      },
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
  }
})
