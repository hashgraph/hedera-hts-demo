import Vue from "vue";
import Vuex from "vuex";
import { createAccount } from "../service/createAccount";
import { getAccountInfo } from "../service/getAccountInfo";
import { getTokenInfoFake } from "../service/getTokenInfo";
import { notifySuccess } from "../utils";
import {EventBus} from "../eventBus";
Vue.use(Vuex);

let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "{}");
let storedTokens = JSON.parse(localStorage.getItem("tokens") || "{}");

export default new Vuex.Store({
  state: {
    tokens: {},
    accounts: {},
    currentTokenId: undefined,
    nonce: ''
  },
  mutations: {
    setCurrentTokenId(state, tokenId) {
      state.currentTokenId = tokenId;
      state.nonce = Date.now().toString();
    },
    setTokens(state, tokens) {
      // console.log("Mutating - set Tokens " + Object.keys(tokens).length);
      state.tokens = tokens;
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
      state.nonce = Date.now().toString();
    },
    setAccounts(state, accounts) {
      // console.log("Mutating - set Accounts - " + Object.keys(accounts).length);
      state.accounts = accounts;
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
      state.nonce = Date.now().toString();
    },
    setAccount(state, account) {
      Vue.set(state.accounts, account.accountId, account);
      // state.accounts[account.accountId] = account;
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
      state.nonce = Date.now().toString();
    },
    setToken(state, token) {
      Vue.set(state.tokens, token.tokenId, token);
      // state.tokens[token.tokenId] = token;
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
      state.nonce = Date.now().toString();
    },
    reset(state) {
      storedAccounts = {};
      storedTokens = {};
      state.accounts = {};
      state.tokens = {};
      state.currentTokenId = undefined;
    },
    wipeAccount(state, wipeInstruction) {
      const accountId = wipeInstruction.accountId;
      const tokenId = wipeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== 'undefined') {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== 'undefined') {
          console.info("(wipe) account " + accountId + ", token " + tokenId + " wiped");
          state.accounts[accountId].tokenRelationships[tokenId].balance = 0;
          localStorage.setItem("accounts", JSON.stringify(state.accounts));
          state.nonce = Date.now().toString();
          return;
        } else {
          console.warn("(wipe) account " + accountId + ", token " + tokenId + " no relation found");
        }
      } else {
        console.warn("(wipe) account " + accountId + ", token " + tokenId + " no account found");
      }
    },
    freezeAccount(state, freezeInstruction) {
      const accountId = freezeInstruction.accountId;
      const tokenId = freezeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== 'undefined') {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== 'undefined') {
          const freeze = freezeInstruction.freeze ? 1 : 2;
          console.info("(freeze) account " + accountId + ", token " + tokenId + " (un)freeze=" + freeze);
          state.accounts[accountId].tokenRelationships[tokenId].freezeStatus = freeze;
          localStorage.setItem("accounts", JSON.stringify(state.accounts));
          state.nonce = Date.now().toString();
          return;
        } else {
          console.warn("(freeze) account " + accountId + ", token " + tokenId + " no relation found");
        }
      } else {
        console.warn("(freeze) account " + accountId + ", token " + tokenId + " no account found");
      }
    },
    kycAccount(state, kycInstruction) {
      const accountId = kycInstruction.accountId;
      const tokenId = kycInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== 'undefined') {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== 'undefined') {
          const kyc = kycInstruction.kyc ? 1 : 2;
          console.info("(kyc) account " + accountId + ", token " + tokenId + " (un)kyc=" + kyc);
          state.accounts[accountId].tokenRelationships[tokenId].kycStatus = kyc;
          localStorage.setItem("accounts", JSON.stringify(state.accounts));
          state.nonce = Date.now().toString();
          return;
        } else {
          console.warn("(kyc) account " + accountId + ", token " + tokenId + " no relation found");
        }
      } else {
        console.warn("(kyc) account " + accountId + ", token " + tokenId + " no account found");
      }
    }
  },
  getters: {
    nonce(state) {
      return state.nonce;
    },
    currentTokenId(state) {
      return state.currentTokenId;
    },
    numberOfTokens(state) {
      return Object.keys(state.tokens).length || 0;
    },
    numberOfAccounts(state) {
      return Object.keys(state.accounts).length || 0;
    },
    getTokens(state) {
      if (typeof state.tokens === 'undefined') {
        return {};
      } else {
        return state.tokens;
      }
    },
    getAccounts(state) {
      if (typeof state.accounts === 'undefined') {
        return {}
      } else {
        return state.accounts;
      }
    }
  },
  actions: {
    async setup({ commit }) {
      if (Object.keys(storedAccounts).length === 0) {
        // set ourselves up
        // create owner account
        let newAccount = await createAccount();
        newAccount.account.owner = true;
        commit("setAccount", newAccount);
        // create user 1
        newAccount = await createAccount();
        newAccount.account.owner = false;
        commit("setAccount", newAccount);
        // create user 2
        newAccount = await createAccount();
        newAccount.account.owner = false;
        commit("setAccount", newAccount);

      } else {
        commit("setTokens", storedTokens);
        commit("setAccounts", storedAccounts);
      }
      commit("setCurrentTokenId", undefined);
      notifySuccess("Demo Ready");
      EventBus.$emit("busy",false);
    },
    async fetchAccounts({ commit, state }) {
      // don't fetch if localstorage has been cleared
      if (Object.keys(localStorage.getItem("accounts") || {}) === 0) {
        return;
      }
      for (const key in state.accounts) {
        let account = state.accounts[key];
        if ((typeof account.tokenRelationships === "undefined")
            || (Object.keys(account.tokenRelationships).length === 0)) {
          account.tokenRelationships = await getAccountInfo(
              account.accountId);
          commit("setAccount", account);
        }

      }
    },
    async fetchTokens({ commit, state }) {
      // don't fetch if localstorage has been cleared
      if (Object.keys(localStorage.getItem("tokens") || {}) === 0) {
        return;
      }
      if (typeof state.tokens === 'undefined') {
        return;
      }
      for (const key in state.tokens) {
        const tokenUpdate = await getTokenInfoFake(state.tokens[key]);
        commit("setToken", tokenUpdate);
      }
    },
    async fetch({ dispatch }) {
      await dispatch("fetchAccounts");
      await dispatch("fetchTokens");
    },
  },
  modules: {}
});
