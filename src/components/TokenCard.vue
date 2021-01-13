<template>
  <v-card>
    <v-toolbar :color="headingColor" dark>
      <v-toolbar-title class="white--text">{{ token.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="showDetails">
        <v-icon color="white">mdi-magnify</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-row>
        <v-col cols="6">Id</v-col>
        <v-col cols="6"
          ><a :href="tokenMirrorURL" target="_blank">{{
            token.tokenId
          }}</a></v-col
        >
      </v-row>
      <v-row>
        <v-col cols="6">Symbol</v-col>
        <v-col v-if="fileMirrorURL" cols="6"
          ><a :href="fileMirrorURL" target="_blank">{{
            token.symbol
          }}</a></v-col
        >
        <v-col v-else cols="6">{{ token.symbol }}</v-col>
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
      <v-btn color="red darken-1" disabled icon @click="deleteToken">
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { EventBus } from "../eventBus";
import { amountWithDecimals } from "../utils";
import { tokenDelete } from "../service/tokenService";

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
      mirrorURL: "https://testnet.dragonglass.me/hedera/search?q=",
      tokenMirrorURL: "",
      fileMirrorURL: "",
      totalSupply: 0.0,
      interval: undefined,
      headingColor: "primary"
    };
  },
  created() {
    this.token = this.$store.getters.getTokens[this.tokenId];
    this.defaultFreezeStatus = this.token.defaultFreezeStatus;

    this.token.isNFT = this.token.symbol.includes("HEDERA://");
    if (this.token.isNFT) {
      this.fileMirrorURL = this.mirrorURL.concat(
        this.token.symbol.replace("HEDERA://", "")
      );
    }

    if (this.isDeleted) {
      this.headingColor = "red";
    } else {
      this.headingColor = this.token.isNFT ? "" : "primary";
    }

    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.token = this.$store.getters.getTokens[this.tokenId];
      this.tokenMirrorURL = this.mirrorURL.concat(this.tokenId);
      this.isDeleted = this.token.deleted;
      this.totalSupply = amountWithDecimals(
        this.token.totalSupply,
        this.token.decimals
      );
      this.defaultFreezeStatus = this.token.defaultFreezeStatus;
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
        isNFT: this.token.isNFT,
        user: "Issuer",
        name: this.token.name
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
    async deleteToken() {
      EventBus.$emit("busy", true);
      await tokenDelete(this.token);
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
