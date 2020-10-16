import Vue from "vue";
import Vuex from "vuex";
import { createAccount } from "../service/createAccount";
import { getAccountInfo } from "../service/getAccountInfo";
import { getTokenInfoFake } from "../service/getTokenInfo";
import { notifySuccess } from "../utils";
import {EventBus} from "../eventBus";
Vue.use(Vuex);

let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
let storedTokens = JSON.parse(localStorage.getItem("tokens") || "[]");

export default new Vuex.Store({
  state: {
    tokens: [],
    accounts: [],
    currentToken: undefined,
    nonce: ''
  },
  mutations: {
    currentToken(state, tokenId) {
      state.currentToken = tokenId;
      state.nonce = Date.now().toString();
    },
    setTokens(state, tokens) {
      // console.log("Mutating - set Tokens " + tokens.length);
      state.tokens = tokens;
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
      state.nonce = Date.now().toString();
    },
    setAccounts(state, accounts) {
      // console.log("Mutating - set Accounts - " + accounts.length);
      state.accounts = accounts;
      localStorage.setItem("accounts", JSON.stringify(state.accounts));
      state.nonce = Date.now().toString();
    },
    addToken(state, token) {
      state.tokens.push(token);
      localStorage.setItem("tokens", JSON.stringify(state.tokens));
      state.nonce = Date.now().toString();
    },
    reset(state) {
      storedAccounts = [];
      storedTokens = [];
      state.accounts = [];
      this.tokens = [];
      state.currentToken = undefined;
    },
    wipeAccount(state, wipeInstruction) {
      let accounts = state.accounts;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].accountId === wipeInstruction.accountId) {
          if (typeof accounts[i].account.tokenRelationships !== "undefined") {
            const relationships = accounts[i].account.tokenRelationships;
            for (let r = 0; r < relationships.length; r++) {
              if (relationships[r].tokenId === wipeInstruction.tokenId) {
                accounts[i].account.tokenRelationships[r].balance = 0;
                state.accounts = accounts;
                localStorage.setItem("accounts", JSON.stringify(state.accounts));
                state.nonce = Date.now().toString();
                return;
              }
            }
          }
        }
      }
    },
    freezeAccount(state, freezeInstruction) {
      let accounts = state.accounts;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].accountId === freezeInstruction.accountId) {
          if (typeof accounts[i].account.tokenRelationships !== "undefined") {
            const relationships = accounts[i].account.tokenRelationships;
            for (let r = 0; r < relationships.length; r++) {
              if (relationships[r].tokenId === freezeInstruction.tokenId) {
                if (freezeInstruction.freeze) {
                  accounts[i].account.tokenRelationships[r].freezeStatus = 1;
                  console.log("Setting account " + i + " token " + r + " to frozen (1)");
                } else {
                  accounts[i].account.tokenRelationships[r].freezeStatus = 2;
                  console.log("Setting account " + i + " token " + r + " to unfrozen (2)");
                }
                state.accounts = accounts;
                localStorage.setItem("accounts", JSON.stringify(state.accounts));
                state.nonce = Date.now().toString();
                return;
              }
            }
          }
        }
      }
    },
    kycAccount(state, kycInstruction) {
      let accounts = state.accounts;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].accountId === kycInstruction.accountId) {
          if (typeof accounts[i].account.tokenRelationships !== "undefined") {
            const relationships = accounts[i].account.tokenRelationships;
            for (let r = 0; r < relationships.length; r++) {
              if (relationships[r].tokenId === kycInstruction.tokenId) {
                if (kycInstruction.kyc) {
                  console.log("Setting account " + i + " token " + r + " to kycd (1)");
                  accounts[i].account.tokenRelationships[r].kycStatus = 1;
                } else {
                  console.log("Setting account " + i + " token " + r + " to not kycd (2)");
                  accounts[i].account.tokenRelationships[r].kycStatus = 2;
                }
                state.accounts = accounts;
                localStorage.setItem("accounts", JSON.stringify(state.accounts));
                state.nonce = Date.now().toString();
                return;
              }
            }
          }
        }
      }
    }
  },
  getters: {
    nonce(state) {
      return state.nonce;
    },
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
      if (typeof state.tokens === 'undefined') {
        return [];
      } else {
        return state.tokens;
      }
    },
    getAccounts(state) {
      if (typeof state.accounts === 'undefined') {
        return [];
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
        storedAccounts.push(newAccount);
        // create user 1
        newAccount = await createAccount();
        newAccount.account.owner = false;
        storedAccounts.push(newAccount);
        // create user 2
        newAccount = await createAccount();
        newAccount.account.owner = false;
        storedAccounts.push(newAccount);

      }
      commit("setAccounts", storedAccounts);
      commit("setTokens", storedTokens);
      commit("currentToken", undefined);
      notifySuccess("Demo Ready");
      EventBus.$emit("busy",false);
    },
    async fetchAccounts({ commit, state }) {
      let accounts = state.accounts;
      for (let i = 0; i < accounts.length; i++) {
        if ((typeof accounts[i].account.tokenRelationships === "undefined")
          || (accounts[i].account.tokenRelationships.length === 0 )) {
          accounts[i].account.tokenRelationships = await getAccountInfo(
              accounts[i].accountId
          );
        }
      }
      commit("setAccounts", accounts);
    },
    async fetchTokens({ commit, state }) {
      let tokens = state.tokens;
      for (let i = 0; i < tokens.length; i++) {
        //fetch token details from DB
        tokens[i] = await getTokenInfoFake(tokens[i]);
      }
      commit("setTokens", tokens);
    },
    async fetch({ dispatch }) {
      await dispatch("fetchAccounts");
      await dispatch("fetchTokens");
    },
  },
  modules: {}
});
