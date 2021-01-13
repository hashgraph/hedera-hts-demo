<template>
  <v-card :color="cardColor">
    <v-card-title class="justify-center">
      {{ issuer }} (<a :href="accountMirrorURL" target="_blank">{{
        accountRelation.accountId
      }}</a
      >)
    </v-card-title>
    <v-card-title class="justify-center"
      >Token Balance: {{ balance }}</v-card-title
    >
    <v-card-subtitle class="justify-center"
      >hBar Balance: {{ accountRelation.hbarBalance }}</v-card-subtitle
    >
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-checkbox
            label="Frozen"
            disabled
            :input-value="freezeStatus"
          ></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox
            label="KYCd"
            disabled
            :input-value="kycStatus"
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        v-if="freezeStatus"
        color="green darken-1"
        @click="freeze(false)"
        :disabled="relation.freezeStatus === null"
        text
      >
        Unfreeze
      </v-btn>
      <v-btn
        v-else
        color="red darken-1"
        @click="freeze(true)"
        text
        :disabled="relation.freezeStatus === null"
      >
        Freeze
      </v-btn>
      <v-btn
        v-if="kycStatus"
        color="red darken-1"
        @click="kyc(false)"
        :disabled="relation.kycStatus === null"
        text
      >
        Revoke KYC
      </v-btn>
      <v-btn
        v-else
        color="green darken-1"
        @click="kyc(true)"
        text
        :disabled="relation.kycStatus === null"
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
  tokenGrantKYC,
  tokenRevokeKYC,
  tokenFreeze,
  tokenWipe,
  tokenUnFreeze
} from "../service/tokenService";

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
      mirrorURL: "https://testnet.dragonglass.me/hedera/search?q=",

      issuer: this.$store.getters.getAccounts[this.accountRelation.accountId]
        .account.wallet,
      cardColor:
        this.$store.getters.getAccounts[this.accountRelation.accountId].account
          .wallet === "Issuer"
          ? "yellow lighten-4"
          : "",
      accountMirrorURL: "",
      nonce: this.$store.getters.nonce,
      tokenId: this.accountRelation.token.tokenId,
      relation: this.$store.getters.getAccounts[this.accountRelation.accountId]
        .tokenRelationships[this.accountRelation.token.tokenId],
      wipeKey: this.accountRelation.token.wipeKey,
      interval: undefined,
      kycStatus: false,
      freezeStatus: false
    };
  },
  created() {
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.accountMirrorURL = this.mirrorURL.concat(
      this.accountRelation.accountId
    );
    this.interval = setInterval(() => {
      this.relation = this.$store.getters.getAccounts[
        this.accountRelation.accountId
      ].tokenRelationships[this.accountRelation.token.tokenId];

      if (this.relation.kycStatus === null) {
        this.kycStatus = false;
      } else {
        this.kycStatus = this.relation.kycStatus;
      }
      if (this.relation.freezeStatus === null) {
        this.freezeStatus = false;
      } else {
        this.freezeStatus = this.relation.freezeStatus;
      }
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
        tokenId: this.accountRelation.token.tokenId,
        amount: this.relation.balance
      };
      if (await tokenWipe(wipeInstruction)) {
        this.$store.commit("wipeAccount", wipeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async freeze(freezeStatus) {
      EventBus.$emit("busy", true);
      const freezeInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.accountRelation.token.tokenId
      };
      if (freezeStatus) {
        await tokenFreeze(freezeInstruction);
      } else {
        await tokenUnFreeze(freezeInstruction);
      }
      EventBus.$emit("busy", false);
    },
    async kyc(kyc) {
      EventBus.$emit("busy", true);
      const kycInstruction = {
        accountId: this.accountRelation.accountId,
        tokenId: this.accountRelation.token.tokenId
      };
      if (kyc) {
        await tokenGrantKYC(kycInstruction);
      } else {
        await tokenRevokeKYC(kycInstruction);
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
