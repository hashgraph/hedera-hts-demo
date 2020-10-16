<template>
  <v-card
  :color="cardColor"
  >
    <v-card-title class="justify-center"
      >{{ accountRelation.accountId }} {{ owner }}</v-card-title
    >
    <v-card-text>
      <v-row>
        <v-col cols="6">Account Id</v-col>
        <v-col cols="6"
          ><a :href="mirrorURL" target="_blank">{{ accountRelation.accountId }}</a></v-col
        >
      </v-row>
      <v-row>
        <v-col cols="6">Balance</v-col>
        <v-col cols="6">{{ accountRelation.balance }}</v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn v-if="accountRelation.freezeStatus === 1" color="green darken-1"
        @click="freeze(false)"
        text
      >
        Unfreeze
      </v-btn>
      <v-btn v-if="accountRelation.freezeStatus === 2" color="red darken-1"
        @click="freeze(true)"
        text
      >
        Freeze
      </v-btn>
      <v-btn v-if="accountRelation.kycStatus === 1" color="red darken-1"
        @click="kyc(false)"
        text
      >
        Revoke KYC
      </v-btn>
      <v-btn v-if="accountRelation.kycStatus === 2" color="green darken-1"
        @click="kyc(true)"
        text
      >
        Grant KYC
      </v-btn>
      <v-btn v-if="accountRelation.wipeKey"
        color="red darken-1"
        @click="wipe"
        text
      >
        Wipe
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {freezeAccount, kycAccount, wipeAccount} from "../service/accountActions";
import {EventBus} from "../eventBus";

export default {
  name: "AccountCard",
  props: {
    accountRelation: Object,
  },
  data: function() {
    return {
      dirty: false,
      owner: this.accountRelation.owner ? " (Owner)" : "",
      token: this.$store.getters.currentToken,
      cardColor: this.accountRelation.owner ? "yellow lighten-4" : "",
      mirrorURL: "https://explorer.kabuto.sh/testnet/id/".concat(
          this.accountRelation.accountId),
      nonce: this.$store.getters.nonce
    }
  },
  methods: {
    async wipe() {
      EventBus.$emit("busy", true);
      const wipeInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.token.tokenId
      };
      console.log("wiping " + this.accountRelation.accountId + "-" + this.tokenId);
      if (await wipeAccount(wipeInstruction)) {
        this.$store.commit("wipeAccount", wipeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async freeze(freezeStatus) {
      EventBus.$emit("busy", true);
      const freezeInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.token.tokenId,
        freeze: freezeStatus
      };
      if (await freezeAccount(freezeInstruction)) {
        console.log("freezing " + this.accountRelation.accountId + "-" + this.tokenId);
        this.$store.commit("freezeAccount", freezeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async kyc(kyc) {
      EventBus.$emit("busy", true);
      const kycInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.token.tokenId,
        kyc: kyc
      };
      if (await kycAccount(kycInstruction)) {
        console.log("kyc " + this.accountRelation.accountId + "-" + this.tokenId);
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
