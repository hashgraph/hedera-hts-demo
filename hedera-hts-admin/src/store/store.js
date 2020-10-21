import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import { createAccount } from "../service/createAccount";
import { getAccountInfo } from "../service/getAccountInfo";
import { getTokenInfoFake } from "../service/getTokenInfo";
import { notifySuccess } from "../utils";
import { EventBus } from "../eventBus";
Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    tokens: {},
    accounts: {},
    currentTokenId: undefined,
    nonce: "",
    enablePoll: false
  },
  mutations: {
    setPolling(state, polling) {
      console.log("polling set to " + polling);
      state.enablePoll = polling;
    },
    setCurrentTokenId(state, tokenId) {
      state.currentTokenId = tokenId;
      state.nonce = Date.now().toString();
    },
    setTokens(state, tokens) {
      state.tokens = tokens;
      state.nonce = Date.now().toString();
    },
    setAccounts(state, accounts) {
      state.accounts = accounts;
      state.nonce = Date.now().toString();
    },
    setAccount(state, account) {
      Vue.set(state.accounts, account.accountId, account);

      state.nonce = Date.now().toString();
    },
    setToken(state, token) {
      Vue.set(state.tokens, token.tokenId, token);
      state.nonce = Date.now().toString();
    },
    reset(state) {
      state.accounts = {};
      state.tokens = {};
      state.currentTokenId = undefined;
    },
    wipeAccount(state, wipeInstruction) {
      const accountId = wipeInstruction.accountId;
      const tokenId = wipeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          console.info(
            "(wipe) account " + accountId + ", token " + tokenId + " wiped"
          );
          state.accounts[accountId].tokenRelationships[tokenId].balance = 0;
          // localStorage.setItem("accounts", JSON.stringify(state.accounts));
          state.nonce = Date.now().toString();
          return;
        } else {
          console.warn(
            "(wipe) account " +
              accountId +
              ", token " +
              tokenId +
              " no relation found"
          );
        }
      } else {
        console.warn(
          "(wipe) account " +
            accountId +
            ", token " +
            tokenId +
            " no account found"
        );
      }
    },
    freezeAccount(state, freezeInstruction) {
      const accountId = freezeInstruction.accountId;
      const tokenId = freezeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          const freeze = freezeInstruction.freeze ? 1 : 2;
          console.info(
            "(freeze) account " +
              accountId +
              ", token " +
              tokenId +
              " (un)freeze=" +
              freeze
          );
          account.tokenRelationships[tokenId].freezeStatus = freeze;
          Vue.set(state.accounts, accountId, account);
          state.nonce = Date.now().toString();
          console.log("freezeAccount " + state.accounts[accountId].tokenRelationships[tokenId].freezeStatus);
          return;
        } else {
          console.warn(
            "(freeze) account " +
              accountId +
              ", token " +
              tokenId +
              " no relation found"
          );
        }
      } else {
        console.warn(
          "(freeze) account " +
            accountId +
            ", token " +
            tokenId +
            " no account found"
        );
      }
    },
    kycAccount(state, kycInstruction) {
      const accountId = kycInstruction.accountId;
      const tokenId = kycInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          const kyc = kycInstruction.kyc ? 1 : 2;
          console.info(
            "(kyc) account " +
              accountId +
              ", token " +
              tokenId +
              " (un)kyc=" +
              kyc
          );
          state.accounts[accountId].tokenRelationships[tokenId].kycStatus = kyc;
          state.nonce = Date.now().toString();
          return;
        } else {
          console.warn(
            "(kyc) account " +
              accountId +
              ", token " +
              tokenId +
              " no relation found"
          );
        }
      } else {
        console.warn(
          "(kyc) account " +
            accountId +
            ", token " +
            tokenId +
            " no account found"
        );
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
      if (typeof state.tokens === "undefined") {
        return {};
      } else {
        return state.tokens;
      }
    },
    getAccounts(state) {
      if (typeof state.accounts === "undefined") {
        return {};
      } else {
        return state.accounts;
      }
    }
  },
  actions: {
    async setup({ commit, state }) {
      if (Object.keys(state.accounts).length === 0) {
        // set ourselves up
        // create owner account
        let newAccount = await createAccount("owner");
        commit("setAccount", newAccount);
        notifySuccess("Setting up demo 1/3 - owner account created");
        // create user 1
        newAccount = await createAccount("wallet1");
        commit("setAccount", newAccount);
        notifySuccess("Setting up demo 2/3 - first wallet account created");
        // create user 2
        newAccount = await createAccount("wallet2");
        commit("setAccount", newAccount);
        notifySuccess("Setting up demo 3/3 - second wallet account created");
      }
      commit("setCurrentTokenId", undefined);
      notifySuccess("Demo Ready");
      commit("setPolling", true);
      EventBus.$emit("busy", false);
    },
    async fetchAccounts({ commit, state }) {
      if (typeof state.accounts === "undefined") {
        return;
      }
      if (Object.keys(state.accounts).length === 0) {
        return;
      }
      for (const key in state.accounts) {
        if (!state.enablePoll) {
          return;
        }
        let account = state.accounts[key];
        const accountDetails = await getAccountInfo(key);
        account.tokenRelationships = accountDetails;
        commit("setAccount", account);
      }
    },
    async fetchTokens({ commit, state }) {
      if (typeof state.tokens === "undefined") {
        return;
      }
      if (Object.keys(state.tokens).length === 0) {
        return;
      }
      for (const key in state.tokens) {
        if (!state.enablePoll) {
          return;
        }
        const tokenUpdate = await getTokenInfoFake(state.tokens[key]);
        commit("setToken", tokenUpdate);
      }
    },
    async fetch({ dispatch, state }) {
      if (!state.enablePoll) {
        console.log("Polling disabled");
        return;
      }
      await dispatch("fetchAccounts");
      await dispatch("fetchTokens");
    }
  },
  modules: {}
});
