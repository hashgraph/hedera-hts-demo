<template>
  <v-card>
    <v-card-title class="justify-center"
      >{{ token.name }} ({{ token.symbol }})</v-card-title
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
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.wipeKey"
                      :disabled="!token.adminKey"
                      label="Freeze Key"
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.kycKey"
                      :disabled="!token.adminKey"
                      label="KYC Key"
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.defaultKycStatus"
                      :disabled="!token.kycKey"
                      label="Default KYC"
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.freezeKey"
                      :disabled="!token.adminKey"
                      label="Freeze Key"
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.defaultFreezeStatus"
                      :disabled="!token.freezeKey"
                      label="Default Freeze"
                      @click="setDirty"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="token.deleted"
                      :disabled="token.deleted"
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
        View accounts
      </v-btn>
      <v-btn color="blue darken-1" :disabled="!this.dirty" text @click="update">
        Update
      </v-btn>
      <v-btn color="red darken-1" :disabled="!this.delete" text @click="update">
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "TokenCard",
  props: {
    token: Object
  },
  data: () => ({
    dirty: false,
    delete: false
  }),
  computed: {
    mirrorURL() {
      return "https://explorer.kabuto.sh/testnet/id/".concat(
        this.token.tokenId
      );
    }
  },
  methods: {
    showAccounts() {
      this.$store.commit("currentToken", this.token.tokenId);
    },
    setDirty() {
      this.dirty = true;
    },
    setDelete() {
      this.delete = true;
    },
    update() {
      //TODO: Update token
      //TODO: Update auto renew properties
      console.log("Update token");
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
