<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline text-center"
            >{{ token.name }} ({{ token.symbol }}) - {{ token.tokenId }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6"
                ><v-text-field
                  label="Decimals"
                  :value="token.decimals"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6"
                ><v-text-field
                  label="Supply"
                  :value="supply"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6"
                ><v-text-field
                  label="Treasury"
                  :value="token.treasury"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6"
                ><v-text-field
                  label="Auto Renew Account"
                  :value="token.autoRenewAccount"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6"
                ><v-text-field
                  label="Auto Renew Period"
                  :value="autoRenewPeriod"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6"
                ><v-text-field
                  label="Expiry"
                  :value="expiry"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.adminKey"
                  label="Admin"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.supplyKey"
                  label="Change Supply"
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.kycKey"
                  label="KYC"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.wipeKey"
                  label="Wipe"
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.freezeKey"
                  label="Freeze"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.defaultFreezeStatus"
                  disabled
                  label="Default Freeze"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.isDeleted"
                  label="Deleted"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6"> </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { EventBus } from "../eventBus";
import { amountWithDecimals, secondsToParts } from "../utils";

export default {
  name: "TokenDetailsDialog",
  data: function() {
    return {
      token: {},
      valid: false,
      dialog: false,
      initialSupply: 0,
      supply: 0,
      expiry: 0,
      autoRenewPeriod: ""
    };
  },
  created() {
    const vm = this;
    EventBus.$on("tokenDetails", function(value) {
      vm.dialog = true;
      vm.token = value;
      vm.supply = amountWithDecimals(value.totalSupply, value.decimals);
      vm.expiry = value.expiry;
      vm.autoRenewPeriod = secondsToParts(value.autoRenewPeriod);
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
