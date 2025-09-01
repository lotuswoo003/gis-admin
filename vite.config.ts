import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
export default defineConfig(({ mode }) => {
  const isLynn = mode === 'lynn';
  const proxyTarget = isLynn
    ? 'http://localhost:10201'
    : 'http://192.168.106.97:10200';

  return {
    base: './',
    plugins: [
      vue(),
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
          rewrite: (path) => path.replace(/^\/codex-api/, ''),
        },
      },
    },
    optimizeDeps: { include: ['schart.js'] },
    resolve: {
      alias: {
        '@': '/src',
        '~': '/src/assets',
      },
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
  };
});
