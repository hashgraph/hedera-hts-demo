<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="1000px">
      <v-toolbar>
        <v-tabs centered v-model="tabs">
          <v-tab>Redeem An Item using...</v-tab>
        </v-tabs>
      </v-toolbar>
      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-container>
            <v-virtual-scroll
              :items="redemptionTokensEnabled"
              :item-height="50"
              height="300"
            >
              <template v-slot:default="{ item }">
                <v-list-item>
                  <v-list-item-content>
                    <v-btn @click="redeem(item)" depressed small>
                      Redeem with {{ item.askPrice }}
                      {{ item.token.name }} Token{{
                        item.askPrice > 1 ? "s" : ""
                      }}
                    </v-btn>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-virtual-scroll>

            <v-row>
              <v-col>
                <v-btn text @click="cancel">
                  Cancel
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "@/eventBus";
import { tokenTransfer } from "@/service/tokenService";

export default {
  name: "RedeemPopup",
  data: function() {
    return {
      fungible: "yes",
      dialog: false,
      tabs: null,
      redemptionTokensEnabled: [],
      user: null,
      item: null
    };
  },
  created() {
    EventBus.$on("redeemableItemRedeem", data => {
      const { item, user } = data;

      this.dialog = true;
      this.user = user;
      this.item = item;
      this.redemptionTokensEnabled = [];
      const tokensEnabled = item.tokensEnabled;
      const tokensEnabledIds = Object.keys(tokensEnabled);
      const tokens = this.$store.getters.getTokens;
      tokensEnabledIds.forEach(tokenId => {
        const token = tokens[tokenId];
        this.redemptionTokensEnabled.push({
          token,
          askPrice: tokensEnabled[tokenId]
        });
      });
    });
    EventBus.$on("dialogClose", () => {
      this.dialog = false;
    });
  },
  computed: {},
  methods: {
    cancel: () => {
      EventBus.$emit("dialogClose");
    },
    async redeem(withToken) {
      const result = await tokenTransfer(
        withToken.token.tokenId,
        this.user.accountId,
        Number(withToken.askPrice),
        0,
        withToken.token.treasury
      );
      if (result) {
        this.$store.commit("addRedeemableItemToUser", {
          accountId: this.user.accountId,
          itemName: this.item.itemName
        });
      }

      EventBus.$emit("dialogClose");
    }
  }
};
</script>

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
