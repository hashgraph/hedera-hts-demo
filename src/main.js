import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import vuetify from "./plugins/vuetify";
// import { EventBus } from "./eventBus"; // path to vuetify export

Vue.config.productionTip = false;
Vue.config.productionTip = false;

void store.dispatch("setup");
void store.dispatch("fetch");

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");

// force refresh
// let interval = setInterval(() => {
//   void store.dispatch("fetch");
// }, 2500);

// force refresh
// EventBus.$on("busy", busy => {
  // if (busy) {
  //   clearInterval(interval);
  // } else {
  //   void store.dispatch("fetch");
  //   interval = setInterval(() => {
  //     void store.dispatch("fetch");
  //   }, 2500);
  // }
// });
