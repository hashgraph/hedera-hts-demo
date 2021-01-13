<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid">
        <v-card>
          <v-card-title>
            <span class="headline">Transfer {{ name }}</span>
          </v-card-title>
          <v-card-subtitle v-if="isNFT" class="text-left">
            Transfer one Non Fungible Token
          </v-card-subtitle>
          <v-card-subtitle v-if="!isNFT" class="text-left">
            Transfer a Fungible Token, optionally exchanging hBar in one atomic
            transaction
          </v-card-subtitle>
          <v-card-text>
            <v-container>
              <v-row v-if="transferFrom">
                <v-col cols="12">
                  <v-text-field
                    label="From"
                    v-model="transferFrom"
                    disabled
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-select
                    :items="accounts"
                    item-text="name"
                    item-value="accountId"
                    label="To"
                    v-model="destination"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row v-if="!isNFT">
                <v-col cols="12">
                  <v-text-field
                    label="Token Quantity* (includes decimals, for 100.02 input 10002)"
                    :rules="quantityRules"
                    v-model="quantity"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="destination === marketPlaceAccountId">
                <v-col cols="12">
                  <v-text-field
                    label="Offer* (offer price in hBar)"
                    :rules="integerRules"
                    v-model="offer"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-else>
                <v-col cols="12">
                  <v-text-field
                    label="hBar* (Token(s) recipient pays in hBar)"
                    :rules="integerRules"
                    v-model="hBars"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="transfer"
              :disabled="!formValid"
            >
              Transfer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "../eventBus";
import { tokenTransfer } from "../service/tokenService";
import { getAccountDetails, getUserAccountsWithNames } from "@/utils";

export default {
  name: "TransferDialog",
  data: function() {
    return {
      accounts: getUserAccountsWithNames(""),
      marketPlaceAccountId: getAccountDetails("Marketplace").accountId,
      valid: false,
      dialog: false,
      quantity: 0,
      hBars: 0,
      offer: 0,
      destination: "",
      tokenId: "",
      name: "",
      integerRules: [v => v == parseInt(v) || "Integer required"],
      quantityRules: [
        v => (v == parseInt(v) && v > 0) || "Integer greater than 0 required"
      ],
      transferFrom: "",
      isNFT: false
    };
  },
  computed: {
    formValid() {
      if (this.destination === "") {
        return false;
      }
      if (this.destination === this.marketPlaceAccountId && this.offer != 0) {
        return true;
      } else if (
        this.destination !== this.marketPlaceAccountId &&
        this.quantity != 0
      ) {
        return true;
      }
      return false;
    }
  },
  methods: {
    async transfer() {
      const result = await tokenTransfer(
        this.tokenId,
        this.user,
        this.quantity,
        this.hBars,
        this.destination
      );
      if (result) {
        if (this.destination === this.marketPlaceAccountId) {
          const bid = {
            tokenId: this.tokenId,
            offerAmount: this.offer,
            tokenIssuer: this.user,
            tokenName: this.name
          };
          this.$store.commit("addBid", bid);
        }
        this.dialog = false;
      }
    }
  },
  created() {
    EventBus.$on("transferDialog", operation => {
      this.accounts = getUserAccountsWithNames("");
      this.marketPlaceAccountId = getAccountDetails("Marketplace").accountId;
      this.valid = false;
      this.tokenId = operation.tokenId;
      this.transferFrom = operation.transferFrom;
      this.user = operation.user;
      this.dialog = true;
      this.isNFT = operation.isNFT;
      this.quantity = this.isNFT ? 1 : 0;
      this.offer = 0;
      this.name = operation.name;
    });
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
