<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-card-title>
            <span class="headline">Create a new Token</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Name*"
                    :rules="textRules"
                    v-model="name"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    label="Symbol*"
                    :rules="textRules"
                    v-model="symbol"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Decimals*"
                    required
                    v-model="decimals"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Initial Supply*"
                    required
                    v-model="initialSupply"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                    v-model="adminKey"
                    label="Enable Admin"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="supplyKey"
                    label="Change Supply"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox v-model="kycKey" label="Enable KYC"></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="wipeKey"
                    label="Enable Wipe"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                    v-model="freezeKey"
                    label="Enable Freeze"
                    @click="setFreeze"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="defaultFreezeStatus"
                    :disabled="!freezeKey"
                    label="Default"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
            <br />
            <small
              >Admin, KYC, Wipe and Freeze keys will default to a common key if
              set, they can however be set independently through the API</small
            >
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="create"
              :disabled="!valid"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>
<script>
import { EventBus } from "../eventBus";
import { createTokenFake } from "../service/createToken";
import { Ed25519PrivateKey } from "@hashgraph/sdk";

export default {
  name: "TokenCreate",
  data: function() {
    return {
      valid: false,
      dialog: false,
      decimals: 0,
      initialSupply: 0,
      name: "",
      symbol: "",
      defaultFreezeStatus: false,
      adminKey: true,
      wipeKey: true,
      freezeKey: true,
      kycKey: true,
      supplyKey: true,
      numberRules: [v => v == parseInt(v) || "Plain numeric required"],
      textRules: [v => !!v || "Input required"]
    };
  },
  created() {
    EventBus.$on("tokenCreate", () => {
      this.valid = false;
      this.decimals = 0;
      this.initialSupply = 0;
      this.name = "";
      this.symbol = "";
      this.defaultFreezeStatus = false;
      this.adminKey = true;
      this.wipeKey = true;
      this.freezeKey = true;
      this.kycKey = true;
      this.supplyKey = true;
      this.dialog = true;
    });
  },
  methods: {
    setFreeze() {
      if (this.freezeKey === false) {
        this.defaultFreezeStatus = false;
      }
    },
    async create() {
      EventBus.$emit("busy", true);
      const privateKey = await Ed25519PrivateKey.generate();
      let _defaultFreezeStatus = 0;
      if (this.freezeKey) {
        if (this.defaultFreezeStatus) {
          _defaultFreezeStatus = 1;
        } else {
          _defaultFreezeStatus = 2;
        }
      }

      const token = {
        name: this.name,
        symbol: this.symbol,
        decimals: this.decimals,
        initialSupply: this.initialSupply,
        adminKey: this.adminKey ? privateKey.toString() : undefined,
        kycKey: this.kycKey ? privateKey.toString() : undefined,
        freezeKey: this.freezeKey ? privateKey.toString() : undefined,
        wipeKey: this.wipeKey ? privateKey.toString() : undefined,
        supplyKey: this.supplyKey ? privateKey.toString() : undefined,
        defaultFreezeStatus: _defaultFreezeStatus,
        deleted: false
      };
      const newToken = await createTokenFake(token);
      if (typeof newToken.tokenId !== "undefined") {
        console.log("new token " + newToken.tokenId);
        this.$store.commit("setToken", newToken);
        this.dialog = false;
      } else {
        console.log("Token creation failed");
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
