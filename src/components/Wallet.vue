<template>
  <v-container>
    <RedeemPopup></RedeemPopup>

    <div v-if="accountId">
      <v-toolbar>
        <v-tabs centered v-model="tabs">
          <v-tab>Gift Cards Marketplace</v-tab>
          <v-tab>Transfers and swaps</v-tab>
          <v-tab>Redemption Marketplace</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-data-table
            :headers="bidHeaders"
            :items="bids"
            class="elevation-1"
            hide-default-footer
          >
            <template v-slot:item.tokenName="{ item }">
              {{ item.tokenName }} (<a :href="mirrorURL" target="_blank">{{
                item.tokenId
              }}</a
              >)
            </template>

            <template v-slot:item.image="{ item }">
              <div v-if="!item.template || item.template !== 'giftcard'"></div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-chip color="green dark">
                <v-btn
                  text
                  :disabled="item.tokenIssuer === walletInstance"
                  @click="buy(item)"
                  >Buy
                </v-btn>
              </v-chip>
            </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <v-form ref="form" v-model="valid">
            <v-card class="mx-auto">
              <v-card-text>
                <v-row dense>
                  <v-col cols="3">
                    <v-select
                      :items="accounts"
                      item-text="name"
                      item-value="accountId"
                      label="To/from"
                      v-model="destination1"
                    ></v-select>
                  </v-col>
                  <v-col cols="3">
                    <v-select
                      :items="accountTokens.concat(accountGiftcards)"
                      item-text="tokenName"
                      item-value="tokenId"
                      label="First Token"
                      v-model="tokenToTransfer1"
                    ></v-select>
                  </v-col>
                  <v-col cols="4" v-if="destination1 === marketPlaceAccountId">
                    <v-text-field
                      label="Offer* (offer price in hBar)"
                      :rules="integerRules"
                      v-model="offer1"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col v-else cols="4">
                    <v-text-field
                      label="Token Quantity* (includes decimals, negative to receive)"
                      :rules="integerRules"
                      v-model="quantityToTransfer1"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-select
                      :items="accounts"
                      item-text="name"
                      item-value="accountId"
                      label="To/from"
                      v-model="destination2"
                    ></v-select>
                  </v-col>
                  <v-col cols="3">
                    <v-select
                      :items="accountTokens"
                      item-text="tokenName"
                      item-value="tokenId"
                      label="Second Token"
                      v-model="tokenToTransfer2"
                    ></v-select>
                  </v-col>
                  <v-col cols="4" v-if="destination2 === marketPlaceAccountId">
                    <v-text-field
                      label="Offer* (offer price in hBar)"
                      :rules="integerRules"
                      v-model="offer2"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col v-else cols="4">
                    <v-text-field
                      label="Token Quantity* (includes decimals, negative to receive)"
                      :rules="integerRules"
                      v-model="quantityToTransfer2"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-select
                      :items="accounts"
                      item-text="name"
                      item-value="accountId"
                      label="Hbar To/from"
                      v-model="hbarTo"
                    ></v-select>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="hBar* (negative to send)"
                      :rules="integerRules"
                      v-model="hBars"
                      :disabled="!hbarTo"
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
        </v-tab-item>
        <v-tab-item>
          <v-container>
            <v-data-table
              :items="redemptionMarketplaceItems"
              :headers="redemptionMarketplaceHeaders"
            >
              <template v-slot:item.controls="props">
                <v-btn
                  class="mx-2"
                  dark
                  small
                  color="blue"
                  @click="onRedeemClick(props.item)"
                >
                  Redeem
                </v-btn>
              </template>

              <template v-slot:item.owned="props">
                {{ getUserOwnedRedeemableItems(props.item) }}
              </template>
            </v-data-table>
          </v-container>
        </v-tab-item>
      </v-tabs-items>

      <br />
      <h1>Your Wallet</h1>
      <v-toolbar>
        <v-tabs centered v-model="tabsWallet">
          <v-tab>"Top Up" Tokens</v-tab>
          <v-tab>Gift Cards</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-tabs-items v-model="tabsWallet">
        <v-tab-item>
          <v-row>
            <v-col cols="12">
              <v-data-table
                :headers="tokenHeaders"
                :items="accountTokens"
                class="elevation-1"
                hide-default-footer
              >
                <template v-slot:item.image="{ item }">
                  <v-card
                    elevation="2"
                    v-if="item.template === 'giftcard'"
                    width="400"
                    height="240"
                    :style="{
                      backgroundColor: item.color,
                      borderRadius: '15px',
                      padding: '10px',
                      margin: '20px'
                    }"
                    :href="item.mirrorURL"
                    target="_blank"
                  >
                    <v-card-title>{{ item.company }}</v-card-title>
                    <v-img
                      v-if="item.imageData"
                      :src="item.imageData"
                      max-width="50px"
                      aspect-ratio="1"
                    ></v-img>
                  </v-card>
                  <div
                    v-if="!item.template || item.template !== 'giftcard'"
                  ></div>
                </template>

                <template v-slot:item.tokenName="{ item }">
                  {{ item.tokenName }} (<a
                    :href="item.mirrorURL"
                    target="_blank"
                    >{{ item.tokenId }}</a
                  >)
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
        </v-tab-item>

        <v-tab-item>
          <v-row>
            <v-col cols="12">
              <v-data-table
                :headers="giftcardHeaders"
                :items="accountGiftcards"
                class="elevation-1"
                hide-default-footer
              >
                <template v-slot:item.image="{ item }">
                  <v-card
                    outlined
                    elevation="2"
                    v-if="item.template === 'giftcard'"
                    width="400"
                    height="240"
                    :style="{
                      backgroundColor: item.color,
                      borderRadius: '15px',
                      padding: '10px',
                      margin: '20px',
                      opacity: item.tokenBalance === 1 ? 1 : 0.5
                    }"
                    :href="item.mirrorURL"
                    target="_blank"
                  >
                    <v-card-text>
                      <v-img
                        v-if="item.imageData"
                        :src="item.imageData"
                        max-width="70px"
                        class="mx-auto"
                      ></v-img>
                      <h1 class="text-h4" :style="{ color: item.fontColor }">
                        {{ item.company }}
                      </h1>
                      <h2 class="text-h5" :style="{ color: item.fontColor }">
                        Card Value: {{ item.cardValue }}
                      </h2>
                    </v-card-text>
                  </v-card>
                </template>

                <template v-slot:item.imageURL="{ item }">
                  <a :href="item.imageURL" target="_blank">
                    <v-icon>mdi-file-document</v-icon>
                  </a>
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
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div v-else>Wallet account isn't setup</div>
  </v-container>
</template>

<script>
import { getAccountDetails, getUserAccountsWithNames } from "@/utils";
import { tokenAssociate, tokenDissociate } from "@/service/tokenService";
import { tokenSwap } from "@/service/tokenService";
import { EventBus } from "@/eventBus";
import { fileGetContents } from "@/service/fileService";
import Vue from "vue";
import RedeemPopup from "@/components/RedeemPopup";

export default {
  name: "Wallet",
  components: { RedeemPopup },
  props: ["walletInstance"],
  data: function() {
    return {
      mirrorURL: "https://testnet.dragonglass.me/hedera/search?q=",
      valid: false,
      loading: false,
      numberOfTokens: this.$store.getters.numberOfTokens,
      destination1: "",
      destination2: "",
      tokenToTransfer1: "",
      quantityToTransfer1: 0,
      tokenToTransfer2: "",
      quantityToTransfer2: 0,
      hbarTo: "",
      hBars: 0,
      accountTokens: [],
      accountGiftcards: [],
      redemptionMarketplaceItems: [],
      bids: [],
      tokenProperties: [],
      integerRules: [v => v == parseInt(v) || "Integer required"],
      tokenHeaders: [
        { text: "", align: "center", value: "image" },
        { text: "Token", align: "center", value: "tokenName" },
        { text: "Subscribed", align: "center", value: "related" },
        { text: "hBar Balance", align: "center", value: "hbarBalance" },
        { text: "Token Balance", align: "center", value: "tokenBalance" },
        { text: "Frozen", align: "center", value: "freezeStatus" },
        { text: "KYCd", align: "center", value: "kycStatus" }
      ],
      giftcardHeaders: [
        { text: "Gift Card", align: "center", value: "image" },
        { text: "Metadata", align: "center", value: "imageURL" },
        { text: "Subscribed", align: "center", value: "related" },
        { text: "Owned", align: "center", value: "tokenBalance" },
        { text: "Frozen", align: "center", value: "freezeStatus" },
        { text: "KYCd", align: "center", value: "kycStatus" }
      ],
      bidHeaders: [
        { text: "Token", align: "center", value: "tokenName" },
        { text: "Price", align: "center", value: "offerAmount" },
        { text: "", align: "center", value: "actions" }
      ],
      redemptionMarketplaceHeaders: [
        { text: "Item Name", value: "itemName" },
        { text: "Item Action", value: "controls", sortable: false },
        { text: "Owned", value: "owned", sortable: false }
      ],
      tabs: null,
      tabsWallet: null,
      accounts: getUserAccountsWithNames(this.walletInstance),
      marketPlaceAccountId: getAccountDetails("Marketplace").accountId,
      offer1: 0,
      offer2: 0
    };
  },
  computed: {
    accountId() {
      let account = getAccountDetails(this.walletInstance);
      return account.accountId;
    },
    formValid() {
      if (this.tokenToTransfer1 !== "") {
        if (this.destination1 === "Marketplace") {
          if (!this.offer1 === parseInt(this.offer1)) {
            return false;
          }
        } else {
          if (
            !this.quantityToTransfer1 === parseInt(this.quantityToTransfer1)
          ) {
            return false;
          }
        }
      }

      if (this.tokenToTransfer2 !== "") {
        if (this.destination2 === "Marketplace") {
          if (!this.offer2 === parseInt(this.offer2)) {
            return false;
          }
        } else {
          if (
            !this.quantityToTransfer2 === parseInt(this.quantityToTransfer2)
          ) {
            return false;
          }
        }
      }

      if (!this.hBars === parseInt(this.hBars)) {
        return false;
      }
      if (this.tokenToTransfer1 === "" && this.tokenToTransfer2 === "") {
        return false;
      }

      return this.valid;
    }
  },
  created() {
    this.loadTokenData();
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      if (this.loading) {
        return;
      }
      this.loadTokenData();
      this.$forceUpdate();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    async buy(bid) {
      EventBus.$emit("busy", true);

      await this.associate(bid.tokenId);

      const result = await tokenSwap(
        "Marketplace",
        getAccountDetails(this.walletInstance).accountId,
        bid.tokenId,
        1,
        "",
        "",
        0,
        getAccountDetails(bid.tokenIssuer).accountId,
        bid.offerAmount
      );

      if (result) {
        this.$store.commit("deleteBid", bid);
      }
      EventBus.$emit("busy", false);
    },
    getUserOwnedRedeemableItems(item) {
      const userOwnedRedeemableItems = this.$store.getters
        .getUserOwnedRedeemableItems;
      if (
        userOwnedRedeemableItems[this.accountId] &&
        userOwnedRedeemableItems[this.accountId][item.itemName]
      ) {
        return userOwnedRedeemableItems[this.accountId][item.itemName];
      }
      return "0";
    },
    onRedeemClick(item) {
      EventBus.$emit("redeemableItemRedeem", {
        item,
        user: getAccountDetails(this.walletInstance)
      });
    },
    getColor(status, reverseLogic) {
      if (status === "n/a") return "grey";
      else if (status === "Yes") return reverseLogic ? "red" : "green";
      else return reverseLogic ? "green" : "red";
    },
    async loadTokenData() {
      this.loading = true;
      this.accountTokens = [];
      this.accountGiftcards = [];
      this.bids = [];
      this.redemptionMarketplaceItems = [];

      for (const bid in this.$store.getters.getBids) {
        this.bids.push(this.$store.getters.getBids[bid]);
      }

      const redeemableItemNames = Object.keys(
        this.$store.getters.getRedeemableItems
      );

      redeemableItemNames.forEach(itemName => {
        this.redemptionMarketplaceItems.push(
          this.$store.getters.getRedeemableItems[itemName]
        );
      });

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
          mirrorURL: this.mirrorURL.concat(oneTokenId)
        };
        if (tokens[oneTokenId].symbol.includes("HEDERA://")) {
          const fileId = tokens[oneTokenId].symbol.replace("HEDERA://", "");
          if (!this.tokenProperties[oneTokenId]) {
            // get the file for this token
            const fileContents = await fileGetContents(fileId);
            const fileDataString = new TextDecoder().decode(fileContents);
            const tokenProperties = JSON.parse(fileDataString);
            if (tokenProperties.photo) {
              Vue.set(this.tokenProperties, oneTokenId, tokenProperties);
            }
          }
          oneToken.imageData = this.tokenProperties[oneTokenId].photo;
          oneToken.imageURL = `https://testnet.dragonglass.me/hedera/search?q=${fileId}`;
        }
        if (tokens[oneTokenId].symbol.includes("IPFS://")) {
          const fileId = tokens[oneTokenId].symbol.replace("IPFS://", "");
          if (!this.tokenProperties[oneTokenId]) {
            // get the file for this token
            const fileContents = await fileGetContents(fileId, "IPFS");
            const fileContentsJson = await fileContents.json();
            if (fileContentsJson.photo) {
              Vue.set(this.tokenProperties, oneTokenId, fileContentsJson);
            }
          }
          oneToken.imageData = this.tokenProperties[oneTokenId].photo;
          oneToken.imageURL = `https://cloudflare-ipfs.com/ipfs/${fileId}`;
        }
        if (this.tokenProperties[oneTokenId]) {
          if (
            this.tokenProperties[oneTokenId].Template &&
            this.tokenProperties[oneTokenId].Template !== null
          ) {
            oneToken.template = this.tokenProperties[oneTokenId].Template;
            if (oneToken.template === "giftcard") {
              oneToken.color = this.tokenProperties[oneTokenId].Color;
              oneToken.value = this.tokenProperties[oneTokenId].Value;
              oneToken.company = this.tokenProperties[oneTokenId].CompanyName;
              oneToken.cardValue = this.tokenProperties[oneTokenId].Value;
              oneToken.fontColor = this.tokenProperties[oneTokenId].FontColor;
            }
          }
        }
        if (typeof accountRelations[oneTokenId] !== "undefined") {
          oneToken.related = "Yes";
          oneToken.hbarBalance = Number(
            accountRelations[oneTokenId].hbarBalance
          );
          oneToken.tokenBalance = Number(accountRelations[oneTokenId].balance);
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
        if (oneToken.template === "giftcard") {
          if (oneToken.related === "Yes" && oneToken.tokenBalance > 0) {
            this.accountGiftcards.push(oneToken);
          }
        } else {
          this.accountTokens.push(oneToken);
        }
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
      // if transferring to marketplace, we only transfer 1 token
      if (this.destination1 === this.marketPlaceAccountId) {
        this.quantityToTransfer1 = 1;
      }
      if (this.destination2 === this.marketPlaceAccountId) {
        this.quantityToTransfer2 = 1;
      }
      const result = await tokenSwap(
        this.walletInstance,
        this.destination1,
        this.tokenToTransfer1,
        this.quantityToTransfer1,
        this.destination2,
        this.tokenToTransfer2,
        this.quantityToTransfer2,
        this.hbarTo,
        this.hBars
      );
      if (result) {
        if (this.destination1 === this.marketPlaceAccountId) {
          const bid = {
            tokenId: this.tokenToTransfer1,
            offerAmount: this.offer1,
            tokenIssuer: this.walletInstance
          };
          this.$store.commit("addBid", bid);
        }
        if (this.destination2 === this.marketPlaceAccountId) {
          const bid = {
            tokenId: this.tokenToTransfer2,
            offerAmount: this.offer2,
            tokenIssuer: this.walletInstance
          };
          this.$store.commit("addBid", bid);
        }
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
