import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/reportData': {
        target: 'http://localhost:8083/',
        changeOrigin: false, //  target是域名的话，需要这个参数，
        secure: false //  设置支持https协议的代理,
      },
      '/getmap': {
        target: 'http://localhost:8083/',
        changeOrigin: false,
        secure: false
      },
      '/getmgetRecordScreenIdp': {
        target: 'http://localhost:8083/',
        changeOrigin: false,
        secure: false
      }
    }
  }
});
