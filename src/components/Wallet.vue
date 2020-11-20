<template>
  <v-container>
    <div v-if="accountId">
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="accountTokens"
            class="elevation-1"
            hide-default-footer
          >

            <template v-slot:item.tokenId="{ item }">
                {{ item.tokenSymbol }} ({{ item.tokenId }})
            </template>

            <template v-slot:item.freezeStatus="{ item }">
              <v-chip
                  :color="getColor(item.freezeStatus, true)"
                  dark
              >
                {{ item.freezeStatus }}
              </v-chip>
            </template>

            <template v-slot:item.kycStatus="{ item }">
              <v-chip
                  :color="getColor(item.kycStatus, false)"
                  dark
              >
                {{ item.kycStatus }}
              </v-chip>
            </template>

            <template v-slot:item.related="{ item }">
              <v-chip
                  :color="getColor(item.related, false)"
                  dark
              >
                {{ item.related }}
              </v-chip>
              <v-btn v-if="item.related === 'No'" color="blue darken-1" text @click="associate(item.tokenId)">
                <v-icon>mdi-link-variant</v-icon>
              </v-btn>
              <v-btn v-else color="blue darken-1" text @click="dissociate(item.tokenId)">
                <v-icon>mdi-link-variant-off</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-card class="mx-auto ma-4">
        <v-toolbar color="primary" dark>
          <v-toolbar-title class="white--text">Transfers and swaps to/from {{ transferTo }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-select
                  :items="transferableTokens"
                  label="Token 1"
                  v-model="tokenToTransfer1"
              ></v-select>
            </v-col>
            <v-col cols="5">
              <v-text-field
                  label="Token Quantity* (includes decimals, negative to receive)"
                  :rules="integerRules"
                  v-model="quantityToTransfer1"
                  required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-select
                  :items="transferableTokens"
                  label="Token 2"
                  v-model="tokenToTransfer2"
              ></v-select>
            </v-col>
            <v-col cols="5">
              <v-text-field
                  label="Token Quantity* (includes decimals, negative to receive)"
                  :rules="integerRules"
                  v-model="quantityToTransfer2"
                  required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5">
              <v-text-field
                  label="hBar* (negative to send)"
                  :rules="integerRules"
                  v-model="hBars"
                  required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
              text
              color="blue darken-1"
              @click="tokenSwap"
              :disabled="!formValid"
          >
            Transfer
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
    <div v-else>Wallet account isn't setup</div>
  </v-container>
</template>

<script>
import { amountWithDecimals, getAccountDetails } from "../utils";
import { EventBus } from "../eventBus";
import { tokenAssociate, tokenDissociate } from "../service/tokenService";
import {tokenSwap} from "@/service/tokenService";

export default {
  name: "Wallet",
  props: ["walletInstance"],
  data: function() {
    return {
      tokens: this.$store.getters.getTokens,
      numberOfTokens: this.$store.getters.numberOfTokens,
      currentToken: this.$store.getters.getTokens[
        localStorage.getItem(this.walletInstance) || ""
      ],
      transferTo: "",
      tokenToTransfer1: "",
      quantityToTransfer1: 0,
      tokenToTransfer2: "",
      quantityToTransfer2: 0,
      hBars: 0,
      accountRelation: undefined,
      canTransfer: false,
      balance: 0,
      hbarBalance: 0,
      kycStatus: false,
      freezeStatus: false,
      accountTokens: [],
      transferableTokens: [],
      integerRules: [v => v == parseInt(v) || "Integer required"],
      headers: [
        { text: 'Token', align: 'center', value: 'tokenId' },
        { text: 'Associated', align: 'center', value: 'related' },
        { text: 'hBar Balance', align: 'center', value: 'hbarBalance' },
        { text: 'token Balance', align: 'center', value: 'tokenBalance' },
        { text: 'Frozen', align: 'center', value: 'freezeStatus' },
        { text: 'KYCd', align: 'center', value: 'kycStatus' },
      ],
    };
  },
  computed: {
    accountId() {
      let account = getAccountDetails(this.walletInstance);
      return account.accountId;
    },
    formValid() {
      return true;
    }
  },
  created() {
    this.loadTokenData();
    const walletToken = localStorage.getItem(this.walletInstance) || undefined;
    if (typeof walletToken !== "undefined") {
      this.setCurrentToken(this.tokens[walletToken]);
    }
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.tokens = this.$store.getters.getTokens;
      if (
        typeof this.tokens !== "undefined" &&
        typeof this.$store.getters.getAccounts !== "undefined"
      ) {
        const accountRelations = this.$store.getters.getAccounts[this.accountId]
          .tokenRelationships;
        for (const tokenId in this.tokens) {
          this.tokens[tokenId].associated =
            typeof accountRelations[tokenId] !== "undefined";
        }
        const walletToken =
          localStorage.getItem(this.walletInstance) || undefined;
        if (typeof walletToken !== "undefined") {
          this.setCurrentToken(this.tokens[walletToken]);
        }
      }
      this.loadTokenData();
      this.$forceUpdate();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getColor(status, reverseLogic) {
      if (status === "n/a") return 'grey';
      else if (status === "Yes") return reverseLogic ? 'red' : 'green';
      else return reverseLogic ? 'green' : 'red';
    },
    loadTokenData() {
      this.transferableTokens = [];
      this.accountTokens = [];

      if (this.walletInstance === "wallet1") {
        this.transferTo = getAccountDetails("wallet2").accountId;
      } else {
        this.transferTo = getAccountDetails("wallet1").accountId;
      }

      const accountRelations = this.$store.getters.getAccounts[this.accountId]
          .tokenRelationships;
      // cycle all available tokens
      for (const tokenId in this.tokens) {
        const oneToken = {
          tokenId: tokenId,
          tokenSymbol: this.tokens[tokenId].symbol,
          related: "No",
          hbarBalance: "n/a",
          tokenBalance: "n/a",
          freezeStatus: "n/a",
          kycStatus: "n/a",
          transferable: false
        }
        if (typeof accountRelations[tokenId] !== "undefined") {
          oneToken.related = "Yes";
          oneToken.hbarBalance = accountRelations[tokenId].hbarBalance;
          oneToken.tokenBalance = accountRelations[tokenId].balance;
          if (accountRelations[tokenId].freezeStatus === null) {
            oneToken.freezeStatus = "n/a";
          } else {
            oneToken.freezeStatus = (accountRelations[tokenId].freezeStatus) ? "Yes" : "No";
          }
          if (accountRelations[tokenId].kycStatus === null) {
            oneToken.kycStatus = "n/a";
          } else {
            oneToken.kycStatus = (accountRelations[tokenId].kycStatus) ? "Yes" : "No";
          }
        }
        const otherRelation = this.$store.getters.getAccounts[this.transferTo].tokenRelationships;
        if (typeof otherRelation[tokenId] !== "undefined") {
          //TODO: Check kyc and freeze status on other account
          oneToken.transferable = true;
          this.transferableTokens.push(tokenId);
        }
        this.accountTokens.push(oneToken);
      }
    },
    associate(tokenId) {
      tokenAssociate(tokenId, this.walletInstance);
    },
    dissociate(tokenId) {
      tokenDissociate(tokenId, this.walletInstance);
    },
    tokenSwap() {
      tokenSwap(
          this.walletInstance,
          this.transferTo,
          this.tokenToTransfer1,
          this.quantityToTransfer1,
          this.tokenToTransfer2,
          this.quantityToTransfer2,
          this.hBars
      );
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
        fixedDestination: transferTo,
        user: this.walletInstance
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
        this.accountRelation = this.$store.getters.getAccounts[
          this.accountId
        ].tokenRelationships[token.tokenId];
        if (typeof this.accountRelation !== "undefined") {
          this.balance = amountWithDecimals(
            this.accountRelation.balance,
            this.currentToken.decimals
          );
          if (this.accountRelation.kycStatus === null) {
            this.kycStatus = false;
          } else {
            this.kycStatus = this.accountRelation.kycStatus;
          }
          if (this.accountRelation.freezeStatus === null) {
            this.freezeStatus = false;
          } else {
            this.freezeStatus = this.accountRelation.freezeStatus;
          }

          this.canTransfer =
            this.accountRelation.freezeStatus === null ||
            (this.kycStatus && !this.freezeStatus);
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
