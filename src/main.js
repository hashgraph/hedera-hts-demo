import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;
Vue.config.productionTip = false;

void store.dispatch("setup");
void store.dispatch("fetch");

// Let's check if .env file is populated with Testnet credentials
if (
  !process.env.VUE_APP_OPERATOR_KEY ||
  !process.env.VUE_APP_OPERATOR_ID ||
  process.env.VUE_APP_OPERATOR_ID === "0.0.xxxx" ||
  process.env.VUE_APP_OPERATOR_KEY === "302xxx"
) {
  document.body.innerHTML =
    "Hedera Testnet account details not found. Please <a href='https://portal.hedera.com/' target='_blank'>register</a> for a Hedera Testnet account and populate .env file with your Testnet credentials. <br/>Once done, restart the server by running <br/><code>yarn run serve --host 0.0.0.0 --disable-host-check</code><br/> in Terminal to restart the server";
} else {
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount("#app");
}
