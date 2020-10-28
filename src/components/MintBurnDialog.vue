<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-card-title>
            <span v-if="operation === 'mint'" class="headline"
              >Mint additional tokens</span
            >
            <span v-else class="headline">Burn tokens</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Quantity* (includes decimals, for 100.02 input 10002)"
                    :rules="integerRules"
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
              @click="mint"
              :disabled="!valid"
              v-if="operation === 'mint'"
            >
              Mint
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="burn"
              :disabled="!valid"
              v-if="operation === 'burn'"
            >
              Burn
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "../eventBus";
import { tokenBurn, tokenMint } from "../service/tokenService";

export default {
  name: "MintBurnDialog",
  data: function() {
    return {
      valid: true,
      dialog: false,
      quantity: "",
      operation: "",
      tokenId: "",
      integerRules: [v => v == parseInt(v) || "Integer required"]
    };
  },
  methods: {
    async mint() {
      const instruction = {
        tokenId: this.tokenId,
        amount: this.quantity
      };
      this.dialog = !(await tokenMint(instruction));
    },
    async burn() {
      const instruction = {
        tokenId: this.tokenId,
        amount: this.quantity
      };
      this.dialog = !(await tokenBurn(instruction));
    }
  },
  created() {
    EventBus.$on("mintBurnDialog", operation => {
      this.valid = false;
      this.quantity = "";
      this.tokenId = operation.tokenId;
      this.operation = operation.operation;
      this.dialog = true;
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
