<template>
  <v-container>
    <div v-if="accountId">
      <v-row>
        <v-col cols="6">
          <v-card
              class="mx-auto"
              max-width="300"
              tile
          >
            <v-toolbar color="primary" dark>
              <v-toolbar-title class="white--text"
              >Tokens</v-toolbar-title
              >
            </v-toolbar>
            <v-list flat v-if="numberOfTokens !== 0">
              <v-list-item
                  v-for="(token) in tokens"
                  :key="token.tokenId"
                  @click="selectToken(token)"
                  color="primary"
              >
                <v-list-item-icon v-if="token.associated"><v-icon>mdi-link-variant</v-icon></v-list-item-icon>
                <v-list-item-icon v-else><v-icon>mdi-link-variant-off</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="text-left">{{ token.name }}</v-list-item-title>
                  <v-list-item-subtitle class="text-left">{{ token.symbol }} {{ token.tokenId }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-text v-if="numberOfTokens === 0">No tokens</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card
              class="mx-auto"
              max-width="300"
              tile
          >
            <div v-if="currentToken">
              <v-toolbar color="primary" dark>
                <v-toolbar-title class="white--text"
                >{{ currentToken.name }} ({{ currentToken.symbol }})</v-toolbar-title
                >
              </v-toolbar>
              <div v-if="currentToken.associated">
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <v-checkbox
                          v-if="accountRelation.freezeStatus === 0"
                          label="Frozen"
                          indeterminate
                          disabled
                      ></v-checkbox>
                      <v-checkbox
                          v-if="accountRelation.freezeStatus === 1"
                          label="Frozen"
                          input-value="true"
                          disabled
                      ></v-checkbox>
                      <v-checkbox
                          v-if="accountRelation.freezeStatus === 2"
                          label="Frozen"
                          disabled
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                          v-if="accountRelation.kycStatus === 0"
                          label="KYCd"
                          indeterminate
                          disabled
                      ></v-checkbox>
                      <v-checkbox
                          v-if="accountRelation.kycStatus === 1"
                          label="KYCd"
                          input-value="true"
                          disabled
                      ></v-checkbox>
                      <v-checkbox
                          v-if="accountRelation.kycStatus === 2"
                          label="KYCd"
                          disabled
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                          label="Balance"
                          :value="balance"
                          outlined
                          dense
                          disabled
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-subtitle class="justify-center">hBar Balance: {{ accountRelation.hbarBalance }}</v-card-subtitle>
                <v-card-actions class="justify-end">
                  <v-btn icon color="blue darken-1" :disabled="!canTransfer" @click="transferToken">
                    <v-icon>mdi-bank-transfer</v-icon>
                  </v-btn>
                  <v-btn color="red darken-1" text @click="associate(false)">
                    <v-icon>mdi-link-variant-off</v-icon>
                  </v-btn>
                </v-card-actions>

              </div>
              <div v-else>
                <v-card-text v-if="!currentToken.associated">This token is not associated to this account</v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn color="blue darken-1" text @click="associate(true)">
                    <v-icon>mdi-link-variant</v-icon>
                  </v-btn>
                </v-card-actions>
              </div>
            </div>
            <div v-else>
              <v-card-text v-if="numberOfTokens !== 0">Please select a token</v-card-text>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <div v-else>Wallet account isn't setup</div>
  </v-container>
</template>

<script>

import {amountWithDecimals, getAccountDetails} from "../utils";
import {EventBus} from "../eventBus";

export default {
  name: "Wallet",
  props: [ 'walletInstance' ],
  data: function() {
    return {
      tokens: this.$store.getters.getTokens,
      numberOfTokens: this.$store.getters.numberOfTokens,
      currentToken: this.$store.getters.getTokens[localStorage.getItem(this.walletInstance) || ""],
      accountRelation: undefined,
      canTransfer: false,
      balance: 0,
      hbarBalance: 0,
    };
  },
  computed: {
    accountId() {
      let account = getAccountDetails(this.walletInstance);
      return account.accountId;
    }
  },
  created() {
    const walletToken = localStorage.getItem(this.walletInstance) || undefined;
    if (typeof walletToken !== "undefined") {
      this.setCurrentToken(this.tokens[walletToken]);
    }
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.tokens = this.$store.getters.getTokens;
      if (typeof this.tokens !== "undefined" && typeof this.$store.getters.getAccounts !== "undefined") {
        const accountRelations = this.$store.getters.getAccounts[this.accountId].tokenRelationships;
        for (const tokenId in this.tokens) {
          this.tokens[tokenId].associated = (typeof accountRelations[tokenId] !== "undefined");
        }
        const walletToken = localStorage.getItem(this.walletInstance) || undefined;
        if (typeof walletToken !== "undefined") {
          this.setCurrentToken(this.tokens[walletToken]);
        }
      }
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    associate(makeTheLink) {
      console.log("associate " + makeTheLink + "-" + this.currentToken.tokenId);
    },
    transferToken() {
      let transferTo = "";
      if (this.walletInstance === "wallet1") {
        transferTo = getAccountDetails("wallet2").accountId;
      } else {
        transferTo = getAccountDetails("wallet1").accountId;
      }
      const transfer = {
        operation: "transfer",
        tokenId: this.currentToken.tokenId,
        transferFrom: getAccountDetails(this.walletInstance).accountId,
        fixedDestination: transferTo
      };
      EventBus.$emit("transferDialog", transfer);
    },
    selectToken(token) {
      localStorage.setItem(this.walletInstance, token.tokenId);
      this.setCurrentToken(token);
    },
    setCurrentToken(token) {
      this.currentToken = token;
      if (typeof token !== "undefined") {
        this.accountRelation = this.$store.getters.getAccounts[this.accountId].tokenRelationships[token.tokenId];
        if (typeof this.accountRelation !== "undefined") {
          this.balance = amountWithDecimals(this.accountRelation.balance, this.currentToken.decimals);
          this.canTransfer = (this.accountRelation.kycStatus === 1 && this.accountRelation.freezeStatus === 2);
        } else {
          this.canTransfer = false;
          this.balance = 0;
        }
      } else {
        this.balance = 0;
        this.accountRelation = undefined;
        this.canTransfer = false;
      }
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
