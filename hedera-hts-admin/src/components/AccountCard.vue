<template>
  <v-card :color="cardColor">
    <v-card-title class="justify-center"
      ><a :href="mirrorURL" target="_blank">{{ accountRelation.accountId }}</a>
      {{ owner }}</v-card-title
    >
    <v-card-title class="justify-center">Token Balance: {{ balance }}</v-card-title>
    <v-card-subtitle class="justify-center">hBar Balance: {{ accountRelation.hbarBalance }}</v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-checkbox
            v-if="relation.freezeStatus === 0"
            label="Frozen"
            indeterminate
            disabled
          ></v-checkbox>
          <v-checkbox
            v-if="relation.freezeStatus === 1"
            label="Frozen"
            input-value="true"
            disabled
          ></v-checkbox>
          <v-checkbox
            v-if="relation.freezeStatus === 2"
            label="Frozen"
            disabled
          ></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox
            v-if="relation.kycStatus === 0"
            label="KYCd"
            indeterminate
            disabled
          ></v-checkbox>
          <v-checkbox
            v-if="relation.kycStatus === 1"
            label="KYCd"
            input-value="true"
            disabled
          ></v-checkbox>
          <v-checkbox
            v-if="relation.kycStatus === 2"
            label="KYCd"
            disabled
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        v-if="relation.freezeStatus === 1"
        color="green darken-1"
        @click="freeze(false)"
        text
      >
        Unfreeze
      </v-btn>
      <v-btn
        v-if="relation.freezeStatus === 2"
        color="red darken-1"
        @click="freeze(true)"
        text
      >
        Freeze
      </v-btn>
      <v-btn
        v-if="relation.kycStatus === 1"
        color="red darken-1"
        @click="kyc(false)"
        text
      >
        Revoke KYC
      </v-btn>
      <v-btn
        v-if="relation.kycStatus === 2"
        color="green darken-1"
        @click="kyc(true)"
        text
      >
        Grant KYC
      </v-btn>
      <v-btn v-if="wipeKey" color="red darken-1" @click="wipe" text>
        Wipe
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {
  freezeAccount,
  kycAccount,
  wipeAccount
} from "../service/accountActions";
import { EventBus } from "../eventBus";
import { amountWithDecimals } from "../utils";

export default {
  name: "AccountCard",
  props: {
    accountRelation: Object
  },
  data: function() {
    return {
      dirty: false,
      owner:
        this.$store.getters.getAccounts[this.accountRelation.accountId].account
          .wallet === "owner"
          ? " (Owner)"
          : "",
      cardColor: this.$store.getters.getAccounts[this.accountRelation.accountId].account
          .wallet === "owner"
          ? "yellow lighten-4" : "",
      mirrorURL: "https://explorer.kabuto.sh/testnet/id/".concat(
        this.accountRelation.accountId
      ),
      nonce: this.$store.getters.nonce,
      tokenId: this.accountRelation.token.tokenId,
      relation: this.$store.getters.getAccounts[this.accountRelation.accountId]
        .tokenRelationships[this.accountRelation.token.tokenId],
      wipeKey: this.accountRelation.token.wipeKey,
      interval: undefined
    };
  },
  created() {
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.relation = this.$store.getters.getAccounts[
          this.accountRelation.accountId
          ].tokenRelationships[this.accountRelation.token.tokenId];
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  computed: {
    balance() {
      return amountWithDecimals(
        this.relation.balance,
        this.$store.getters.getTokens[this.tokenId].decimals
      );
    }
  },
  methods: {
    async wipe() {
      EventBus.$emit("busy", true);
      const wipeInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.accountRelation.token.tokenId
      };
      if (await wipeAccount(wipeInstruction)) {
        this.$store.commit("wipeAccount", wipeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async freeze(freezeStatus) {
      EventBus.$emit("busy", true);
      const freezeInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.accountRelation.token.tokenId,
        freeze: freezeStatus
      };
      if (await freezeAccount(freezeInstruction)) {
        this.$store.commit("freezeAccount", freezeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async kyc(kyc) {
      EventBus.$emit("busy", true);
      const kycInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.accountRelation.token.tokenId,
        kyc: kyc
      };
      if (await kycAccount(kycInstruction)) {
        console.log(
          "kyc " +
            this.accountRelation.accountId +
            "-" +
            this.accountRelation.token.tokenId
        );
        this.$store.commit("kycAccount", kycInstruction);
      }
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
