import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import webSdk from '@webwsdk/core';
import router from './src/router';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
app.use(webSdk, {
  dsn: 'http://localhost:8083/reportData',
  apikey: 'abcd',
  handleHttpStatus(data) {
    // console.log('data', data);
    const { url, response } = data;
    // code为200，接口正常，反之亦然
    const { code } =
      typeof response === 'string' ? JSON.parse(response) : response;
    if (url.includes('/getErrorList')) {
      return code === 200 ? true : false;
    } else {
      return true;
    }
  }
});
