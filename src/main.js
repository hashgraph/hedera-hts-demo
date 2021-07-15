import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import vuetify from "./plugins/vuetify";

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
