import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Accounts from "../components/Accounts";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Dashboard,
    name: "Dashboard"
  },
  {
    path: "/accounts",
    component: Accounts,
    name: "Accounts"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
