import { createApp } from "vue";
import App from "./app.vue";
import sayHello from "@webwsdk/common";
const app = createApp(App);
const a = 1;
sayHello();
app.mount("#app");
