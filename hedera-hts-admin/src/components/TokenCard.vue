<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title class="white--text"
        >{{ token.name }} ({{ token.symbol.toUpperCase() }})</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn icon @click="showDetails">
        <v-icon color="white">mdi-magnify</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-row>
        <v-col cols="6">Token Id</v-col>
        <v-col cols="6"
          ><a :href="mirrorURL" target="_blank">{{ token.tokenId }}</a></v-col
        >
      </v-row>
      <v-row>
        <v-col cols="6">Decimals</v-col>
        <v-col cols="6">{{ token.decimals }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Supply</v-col>
        <v-col cols="6">{{ totalSupply }}</v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="blue darken-1" icon @click="showAccounts">
        <v-icon>mdi-account-multiple</v-icon>
      </v-btn>
      <v-btn
          :disabled="!this.token.supplyKey"
          color="blue darken-1"
          icon
          @click="mintToken"
      >
        <v-icon>mdi-bank-plus</v-icon>
      </v-btn>
      <v-btn
          :disabled="!this.token.supplyKey"
          color="red darken-1"
          icon
          @click="burnToken"
      >
        <v-icon>mdi-bank-minus</v-icon>
      </v-btn>
      <v-btn icon color="blue darken-1" @click="transferToken">
        <v-icon>mdi-bank-transfer</v-icon>
      </v-btn>
      <v-btn
        icon
        color="blue darken-1"
        :disabled="!this.dirty"
        @click="updateToken"
      >
        <v-icon>mdi-file-document-edit-outline</v-icon>
      </v-btn>
      <v-btn
        color="red darken-1"
        :disabled="this.isDeleted"
        icon
        @click="deleteToken"
      >
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { EventBus } from "../eventBus";
import {amountWithDecimals} from "../utils";

export default {
  name: "TokenCard",
  props: {
    tokenId: String
  },
  data: function() {
    return {
      token: {},
      dirty: false,
      isDeleted: false,
      defaultFreezeStatus: false,
      mirrorURL: "",
      totalSupply: 0.0,
      interval: undefined,
    };
  },
  created() {
    this.token = this.$store.getters.getTokens[this.tokenId];
    this.defaultFreezeStatus = this.token.defaultFreezeStatus === 1;

    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.token = this.$store.getters.getTokens[this.tokenId];
      this.mirrorURL = "https://explorer.kabuto.sh/testnet/id/".concat(
          this.tokenId
      );
      this.isDeleted = this.token.deleted;
      this.totalSupply = amountWithDecimals(
          this.token.totalSupply,
          this.token.decimals
      );
      this.defaultFreezeStatus = this.token.defaultFreezeStatus === 1;
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    mintToken() {
      const mint = {
        operation: "mint",
        tokenId: this.tokenId
      };
      EventBus.$emit("mintBurnDialog", mint);
    },
    burnToken() {
      const burn = {
        operation: "burn",
        tokenId: this.tokenId
      };
      EventBus.$emit("mintBurnDialog", burn);
    },
    transferToken() {
      const transfer = {
        operation: "transfer",
        tokenId: this.tokenId,
        fixedDestination: "",
        transferFrom: ""
      };
      EventBus.$emit("transferDialog", transfer);
    },
    showDetails() {
      EventBus.$emit("tokenDetails", this.token);
    },
    showAccounts() {
      this.$store.commit("setCurrentTokenId", this.tokenId);
    },
    updateToken() {
      EventBus.$emit("busy", true);
      //TODO: Update auto renew properties
      //TODO: Update token name
      //TODO: Update token symbol
      //TODO: Update treasury
      //TODO: Update autoRenewAccount
      //TODO: Update autoRenewPeriod
      //TODO: Update expiry
      // const tokenUpdate = {
      //   tokenId: this.tokenId,
      //   name: this.token.name,
      //   symbol: this.token.symbol,
      //   treasury: this.token.treasury,
      //   autoRenewAccount: this.token.autoRenewAccount,
      //   autoRenewPeriod: this.token.autoRenewPeriod,
      //   expiry: this.token.expiry
      // };
      EventBus.$emit("busy", false);
    },
    deleteToken() {
      //TODO: Delete token
      EventBus.$emit("busy", true);
      console.log("Delete token");
      EventBus.$emit("busy", false);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
