<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline text-center"
            >{{ token.name }} ({{ token.symbol }})</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6"
                ><v-text-field
                  label=""
                  :value="decimals"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6"
                ><v-text-field
                  label=""
                  :value="supply"
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
                  label="Enable Admin"
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
                  label="Enable KYC"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.wipeKey"
                  label="Enable Wipe"
                  disabled
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-checkbox
                  v-model="token.freezeKey"
                  label="Enable Freeze"
                  disabled
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="defaultFreezeStatus"
                  disabled
                  label="Default"
                ></v-checkbox>
              </v-col>
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
import { amountWithDecimals } from "../utils";

export default {
  name: "TokenDetails",
  data: function() {
    return {
      token: {},
      valid: false,
      dialog: false,
      initialSupply: 0,
      defaultFreezeStatus: false,
      decimals: "",
      supply: 0
    };
  },
  created() {
    const vm = this;
    EventBus.$on("tokenDetails", function(value) {
      vm.dialog = true;
      vm.token = value;
      vm.decimals = "Decimals: ".concat(value.decimals);
      vm.supply =
        "Supply: " + amountWithDecimals(value.totalSupply, value.decimals);
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
