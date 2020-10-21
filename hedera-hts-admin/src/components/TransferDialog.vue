<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-card-title>
            <span class="headline">Transfer</span>
          </v-card-title>
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
                <v-col cols="6" v-if="fixedDestination">
                  <v-text-field
                      label="To"
                      v-model="fixedDestination"
                      disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="6" v-else>
                  <v-select
                      :items="accounts"
                      label="To"
                      v-model="destination"
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                      label="Quantity* (includes decimals, for 100.02 input 10002)"
                      :rules="numberRules"
                      v-model="quantity"
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

import {EventBus} from "../eventBus";
import {getUserAccounts} from "../utils";

export default {
  name: "TransferDialog",
  data: function() {
    return {
      accounts: getUserAccounts(),
      valid: false,
      dialog: false,
      quantity: 0,
      destination: "",
      fixedDestination: "",
      tokenId: "",
      numberRules: [v => v == parseInt(v) || "Plain numeric required"],
      transferFrom: "",
    };
  },
  computed: {
    formValid() {
      return this.valid && (this.destination !== "");
    }
  },
  methods: {
    transfer() {
      console.log("transferring " + this.quantity + " to " + this.destination);
      this.dialog = false;
    },
  },
  created() {
    EventBus.$on("transferDialog", operation => {
      this.valid = false;
      this.quantity = 0;
      this.fixedDestination = operation.fixedDestination;
      this.destination = operation.fixedDestination;
      this.tokenId = operation.tokenId;
      this.transferFrom = operation.transferFrom;
      this.dialog = true;
    });
  },

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
