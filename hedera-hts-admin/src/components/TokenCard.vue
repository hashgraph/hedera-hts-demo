<template>
  <v-card>
    <v-card-title class="justify-center"
      >{{ token.name }} ({{ token.symbol.toUpperCase() }})</v-card-title
    >
    <v-card-text>
      <v-row>
        <v-col cols="6">Token Id</v-col>
        <v-col cols="6"
          ><a :href="mirrorURL" target="_blank">{{ token.tokenId }}</a></v-col
        >
      </v-row>
      <v-row>
        <v-col cols="6">Decimals</v-col>
        <v-col cols="6">{{ token.decimals }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Supply</v-col>
        <v-col cols="6">{{ token.totalSupply }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Treasury</v-col>
        <v-col cols="6">{{ token.treasury }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>More details</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.adminKey"
                      disabled
                      label="Admin Key"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.wipeKey"
                      disabled
                      label="Wipe Key"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.kycKey"
                      disabled
                      label="KYC Key"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.freezeKey"
                      disabled
                      label="Freeze Key"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="defaultFreezeStatus"
                      disabled
                      label="Default Freeze"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.deleted"
                      :disabled="isDeleted"
                      label="Deleted"
                      @click="setDelete"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">Auto Renew Account</v-col>
                  <v-col cols="6">{{ token.autoRenewAccount }}</v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">Auto Renew Period</v-col>
                  <v-col cols="6">{{ token.autoRenewPeriod }}</v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">Expiry</v-col>
                  <v-col cols="6">{{ token.expiry }}</v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="blue darken-1" text @click="showAccounts">
        Accounts
      </v-btn>
      <v-btn color="blue darken-1"
        :disabled="!this.dirty"
        text
        @click="updateToken">
        Update
      </v-btn>
      <v-btn color="red darken-1"
        :disabled="!this.delete"
        text
        @click="deleteToken">
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {EventBus} from "../eventBus";

export default {
  name: "TokenCard",
  props: {
    token: Object
  },
  data: function() {
    return {
      dirty: false,
      delete: false,
      isDeleted: this.token.deleted,
      defaultFreezeStatus: false,
      mirrorURL: "https://explorer.kabuto.sh/testnet/id/".concat(
          this.token.tokenId
      )
    };
  },
  created() {
    this.defaultFreezeStatus = (this.token.defaultFreezeStatus === 2);
  },
  methods: {
    showAccounts() {
      this.$store.commit("setCurrentTokenId", this.token.tokenId);
    },
    // setDirty() {
    //   this.dirty = true;
    // },
    setDelete() {
      this.delete = this.token.deleted;
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
    deleteToken() {
      //TODO: Delete token
      EventBus.$emit("busy", true);
      console.log("Delete token");
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
