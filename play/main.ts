import { createApp } from 'vue';
import App from './app.vue';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import webSdk from '@webwsdk/core';
const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
app.use(webSdk, {
  dsn: 'http://localhost:8080/reportData',
  apikey: 'abcd'
});
