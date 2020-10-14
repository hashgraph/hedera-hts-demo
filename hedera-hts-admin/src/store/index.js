import Vue from "vue";
import Vuex from "vuex";
import { createAccount } from "../service/createAccount";
import { getAccountInfo } from "../service/getAccountInfo";
import { getTokenInfo } from "../service/getTokenInfo";
import { notifySuccess } from "../utils";
Vue.use(Vuex);

let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
let storedTokens = JSON.parse(localStorage.getItem("tokens") || "[]");

export default new Vuex.Store({
  state: {
    tokens: [],
    accounts: [],
    currentToken: undefined
  },
  mutations: {
    currentToken(state, tokenId) {
      state.currentToken = tokenId;
    },
    setTokens(state, tokens) {
      console.log("Mutating - set Tokens " + tokens.length);
      state.tokens = tokens;
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
    },
    setAccounts(state, accounts) {
      console.log("Mutating - set Accounts");
      state.accounts = accounts;
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
    },
    addToken(state, token) {
      storedTokens.push(token);
      state.tokens = storedTokens;
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
    },
    reset(state) {
      state.tokens = [];
      state.accounts = [];
      storedAccounts = [];
      localStorage.setItem("accounts", []);
      storedTokens = [];
      localStorage.setItem("tokens", []);
      state.currentToken = undefined;
    }
  },
  getters: {
    currentToken(state) {
      return state.currentToken;
    },
    numberOfTokens(state) {
      return state.tokens.length || 0;
    },
    numberOfAccounts(state) {
      return state.accounts.length || 0;
    },
    getTokens(state) {
      console.log(state);
      return state.tokens;
    }
  },
  actions: {
    async setup({ commit }) {
      if (Object.keys(storedAccounts).length === 0) {
        // set ourselves up
        // create owner account
        let newAccount = await createAccount();
        newAccount.account.owner = true;
        storedAccounts.push(newAccount);
        // create user 1
        newAccount = await createAccount();
        newAccount.account.owner = false;
        storedAccounts.push(newAccount);
        // create user 2
        newAccount = await createAccount();
        newAccount.account.owner = false;
        storedAccounts.push(newAccount);

        commit("setAccounts", storedAccounts);
        commit("currentToken", undefined);
      }
      notifySuccess("Demo Ready");
    },

    async fetchAccounts({ commit }) {
      for (let i = 0; i < storedAccounts.length; i++) {
        storedAccounts[i].account.tokenRelationships = await getAccountInfo(
          storedAccounts[i].accountId
        );
      }
      commit("setAccounts", storedAccounts);
    },

    async fetchTokens({ commit }) {
      for (let i = 0; i < storedTokens.length; i++) {
        //fetch token details from DB
        storedTokens[i].token = await getTokenInfo(storedTokens[i]);
      }
      commit("setTokens", storedTokens);
    },
    async fetch({ dispatch }) {
      await dispatch("fetchAccounts");
      await dispatch("fetchTokens");
    }
  },
  modules: {}
});
