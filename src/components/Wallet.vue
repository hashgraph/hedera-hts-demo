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
            <template v-slot:item.image="{ item }">
              <v-img v-if="item.imageData" :src="item.imageData" max-width="50px" aspect-ratio="1"></v-img>
            </template>

            <template v-slot:item.tokenName="{ item }">
              {{ item.tokenName }} ({{ item.tokenId }})
            </template>

            <template v-slot:item.freezeStatus="{ item }">
              <v-chip :color="getColor(item.freezeStatus, true)" dark>
                {{ item.freezeStatus }}
              </v-chip>
            </template>

            <template v-slot:item.kycStatus="{ item }">
              <v-chip :color="getColor(item.kycStatus, false)" dark>
                {{ item.kycStatus }}
              </v-chip>
            </template>

            <template v-slot:item.related="{ item }">
              <v-chip :color="getColor(item.related, false)" dark>
                {{ item.related }}
              </v-chip>
              <v-btn
                v-if="item.related === 'No'"
                color="blue darken-1"
                text
                @click="associate(item.tokenId)"
              >
                <v-icon>mdi-link-variant</v-icon>
              </v-btn>
              <v-btn
                v-else
                color="blue darken-1"
                text
                @click="dissociate(item.tokenId)"
              >
                <v-icon>mdi-link-variant-off</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid">
        <v-card class="mx-auto ma-4">
          <v-toolbar color="primary" dark>
            <v-toolbar-title class="white--text"
              >Transfers and swaps to/from {{ transferTo }}</v-toolbar-title
            >
          </v-toolbar>
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <v-select
                  :items="accountTokens"
                  item-text="tokenName"
                  item-value="tokenId"
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
                  :items="accountTokens"
                  item-text="tokenName"
                  item-value="tokenId"
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
              <v-col cols="3">
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
      </v-form>
    </div>
    <div v-else>Wallet account isn't setup</div>
  </v-container>
</template>

<script>
import { getAccountDetails } from "@/utils";
import { tokenAssociate, tokenDissociate } from "@/service/tokenService";
import { tokenSwap } from "@/service/tokenService";
import { EventBus } from "@/eventBus";
import {fileGetContents} from "@/service/fileService";
import Vue from "vue";

export default {
  name: "Wallet",
  props: ["walletInstance"],
  data: function() {
    return {
      valid: false,
      loading: false,
      numberOfTokens: this.$store.getters.numberOfTokens,
      transferTo: "",
      tokenToTransfer1: "",
      quantityToTransfer1: 0,
      tokenToTransfer2: "",
      quantityToTransfer2: 0,
      hBars: 0,
      accountTokens: [],
      tokenProperties: [],
      integerRules: [v => v == parseInt(v) || "Integer required"],
      headers: [
        { text: "", align: "center", value: "image" },
        { text: "Token", align: "center", value: "tokenName" },
        { text: "Associated", align: "center", value: "related" },
        { text: "hBar Balance", align: "center", value: "hbarBalance" },
        { text: "token Balance", align: "center", value: "tokenBalance" },
        { text: "Frozen", align: "center", value: "freezeStatus" },
        { text: "KYCd", align: "center", value: "kycStatus" }
      ]
    };
  },
  computed: {
    accountId() {
      let account = getAccountDetails(this.walletInstance);
      return account.accountId;
    },
    formValid() {
      if (
        this.tokenToTransfer1 !== "" &&
        !this.quantityToTransfer1 === parseInt(this.quantityToTransfer1)
      ) {
        return false;
      }
      if (
        this.tokenToTransfer2 !== "" &&
        !this.quantityToTransfer2 === parseInt(this.quantityToTransfer2)
      ) {
        return false;
      }
      if (!this.hBars === parseInt(this.hBars)) {
        return false;
      }
      if (this.tokenToTransfer1 === "" && this.tokenToTransfer2 === "") {
        return false;
      }
      if (
        parseInt(this.quantityToTransfer1) +
          parseInt(this.quantityToTransfer2) ===
        0
      ) {
        return false;
      }

      return this.valid;
    }
  },
  created() {
    this.loadTokenData();
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      if (this.loading) { return; }
      this.loadTokenData();
      this.$forceUpdate();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getColor(status, reverseLogic) {
      if (status === "n/a") return "grey";
      else if (status === "Yes") return reverseLogic ? "red" : "green";
      else return reverseLogic ? "green" : "red";
    },
    async loadTokenData() {
      this.loading = true;
      this.accountTokens = [];

      if (this.walletInstance === "Alice") {
        this.transferTo = getAccountDetails("Bob").accountId;
      } else {
        this.transferTo = getAccountDetails("Alice").accountId;
      }

      const accountRelations = this.$store.getters.getAccounts[this.accountId]
        .tokenRelationships;
      // cycle all available tokens
      const tokens = this.$store.getters.getTokens;
      for (const oneTokenId in tokens) {
        const oneToken = {
          tokenId: oneTokenId,
          tokenSymbol: tokens[oneTokenId].symbol,
          tokenName: tokens[oneTokenId].name,
          related: "No",
          hbarBalance: "n/a",
          tokenBalance: "n/a",
          freezeStatus: "n/a",
          kycStatus: "n/a",
          imageData: undefined,
        };
        if (tokens[oneTokenId].symbol.includes("HEDERA://")) {
          if (! this.tokenProperties[oneTokenId]) {
            // get the file for this token
            const fileId = tokens[oneTokenId].symbol.replace("HEDERA://","");
            const fileContents = await fileGetContents(fileId);
            const fileDataString = new TextDecoder().decode(fileContents);
            const tokenProperties = JSON.parse(fileDataString);
            if (tokenProperties.photo) {
              Vue.set(this.tokenProperties, oneTokenId, tokenProperties);
            }
          }
          oneToken.imageData = this.tokenProperties[oneTokenId].photo;
        }
        if (typeof accountRelations[oneTokenId] !== "undefined") {
          oneToken.related = "Yes";
          oneToken.hbarBalance = accountRelations[oneTokenId].hbarBalance;
          oneToken.tokenBalance = accountRelations[oneTokenId].balance;
          if (accountRelations[oneTokenId].freezeStatus === null) {
            oneToken.freezeStatus = "n/a";
          } else {
            oneToken.freezeStatus = accountRelations[oneTokenId].freezeStatus
              ? "Yes"
              : "No";
          }
          if (accountRelations[oneTokenId].kycStatus === null) {
            oneToken.kycStatus = "n/a";
          } else {
            oneToken.kycStatus = accountRelations[oneTokenId].kycStatus
              ? "Yes"
              : "No";
          }
        }
        this.accountTokens.push(oneToken);
      }
      this.loading = false;
    },
    associate(tokenId) {
      tokenAssociate(tokenId, this.walletInstance);
    },
    dissociate(tokenId) {
      tokenDissociate(tokenId, this.walletInstance);
    },
    async tokenSwap() {
      EventBus.$emit("busy", true);
      await tokenSwap(
        this.walletInstance,
        this.transferTo,
        this.tokenToTransfer1,
        this.quantityToTransfer1,
        this.tokenToTransfer2,
        this.quantityToTransfer2,
        this.hBars
      );
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
