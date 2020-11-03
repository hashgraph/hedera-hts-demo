<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-toolbar color="primary" dark>
        <v-toolbar-title class="white--text"
        >Fungible Token Composer</v-toolbar-title
        >
      </v-toolbar>
      <v-stepper v-model="step" alt-labels>
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1">
            Name
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">
            Fractional
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 3" step="3">
            Supply
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 4" step="4">
            Mutable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 5" step="5">
            KYC
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 6" step="6">
            Wipeable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 7" step="7">
            Freezable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 8" step="8">
            Create
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-form ref="nameForm" v-model="nameValid">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                      label="Name*"
                      :rules="textRules"
                      v-model="name"
                      required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="3">
                  <v-text-field
                      label="Symbol*"
                      :rules="textOnlyRules"
                      v-model="symbol"
                      required
                  ></v-text-field>
                </v-col>
              </v-row>
              </v-form>
            </v-card>
            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn
                    color="primary"
                    @click="step = 2"
                    :disabled="!nameValid"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-form ref="decimalsForm" v-model="decimalsValid">
              <v-radio-group v-model="fractional">
                <v-radio
                    name="fractional"
                    label="Whole"
                    value="whole"
                    @click="validateDecimals()"
                ></v-radio>
                <v-radio
                    name="fractional"
                    label="Fractional"
                    value="fractional"
                    @click="validateDecimals()"
                ></v-radio>
              </v-radio-group>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                      v-if="fractional==='fractional'"
                      label="Decimals*"
                      required
                      v-model="decimals"
                      :rules="decimalsRules"
                  ></v-text-field>
                </v-col>
              </v-row>
              </v-form>
            </v-card>
            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                    @click="step = 1"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 3"
                    :disabled="!decimalsValid && fractional==='fractional'"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-form ref="supplyForm" v-model="supplyValid">
              <v-radio-group v-model="variable">
                <v-radio
                    name="variable"
                    label="Variable"
                    value="variable"
                    @click="validateSupply()"
                ></v-radio>
                <v-radio
                    name="variable"
                    label="Fixed"
                    value="fixed"
                    @click="validateSupply()"
                ></v-radio>
              </v-radio-group>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                        label="Initial Supply*"
                        required
                        v-model="initialSupply"
                        :rules="[ supplyRule ]"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 2"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 4"
                    :disabled="!supplyValid"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="4">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-radio-group v-model="mutable">
                <v-radio
                    name="admin"
                    label="No"
                    value="no"
                ></v-radio>
                <v-radio
                    name="admin"
                    label="Yes"
                    value="yes"
                ></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 3"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 5"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="5">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-radio-group v-model="kyc">
                <v-radio
                    name="kyc"
                    label="No"
                    value="no"
                ></v-radio>
                <v-radio
                    name="kyc"
                    label="Yes"
                    value="yes"
                ></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 4"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 6"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="6">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-radio-group v-model="wipe">
                <v-radio
                    name="wipe"
                    label="No"
                    value="no"
                ></v-radio>
                <v-radio
                    name="wipe"
                    label="Yes"
                    value="yes"
                ></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 5"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 7"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="7">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-radio-group v-model="freeze">
                <v-radio
                    name="freeze"
                    label="No"
                    value="no"
                ></v-radio>
                <v-radio
                    name="freeze"
                    label="Yes"
                    value="yes"
                ></v-radio>
              </v-radio-group>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                      v-model="defaultFreezeStatus"
                      :disabled="freeze === 'no'"
                      label="Default"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 6"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="step = 8"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="8">
            <v-card
                class="mb-12"
                height="200px"
            >
              <v-card-title>You're about to create token {{ name }} ({{ symbol.toUpperCase() }})</v-card-title>
              <v-card-text align="left">{{ tokenDetails() }}</v-card-text>
              <v-card-text align="left">{{ tokenCompliance() }}</v-card-text>
              <v-card-text align="left" v-if="mutable === 'Yes'">An admin key will be able to update it.</v-card-text>
              <v-card-text align="left" v-else>It will be immutable.</v-card-text>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog=false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2"
                       @click="step = 7"
                >
                  Back
                </v-btn>
                <v-btn
                    color="primary"
                    @click="createToken()"
                >
                  Proceed
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "../eventBus";
import {getAccountDetails} from "@/utils";
import {Ed25519PrivateKey} from "@hashgraph/sdk";
import {tokenCreate} from "@/service/tokenService";

export default {
  name: "Composer",
  data: function() {
    return {
      nameValid: false,
      decimalsValid: false,
      supplyValid: false,
      dialog: false,
      step: 1,
      fractional: "whole",
      variable: "variable",
      mutable: "yes",
      kyc: "yes",
      wipe: "yes",
      freeze: "yes",
      decimalsRules: [v => (v == parseInt(v) && v > 0) || "Integer greater than 0 required"],
      textRules: [v => !!v || "Input required"],
      textOnlyRules: [
        v => !!v || "Input required",
        v => /^[a-zA-Z]*$/.test(v) || "Only letters are allowed"
      ],
      name: "",
      symbol: "",
      decimals: "",
      initialSupply: "",
      defaultFreezeStatus: false,
    };
  },
  created() {
    EventBus.$on("tokenCompose", () => {
      this.dialog = true;
      this.nameValid = false;
      this.decimalsValid = false;
      this.supplyValid = false;
      this.fractional = "whole";
      this.variable = "variable";
      this.mutable = "yes";
      this.kyc = "yes";
      this.wipe = "yes";
      this.freeze = "yes";
      this.step = "1"
      //
      this.name = "";
      this.symbol = "";
      this.decimals = "";
      this.initialSupply = "";
      this.defaultFreezeStatus = false;
    });
  },
  computed: {
  },
  methods: {
    supplyRule(v) {
      if (this.variable === "fixed") {
        if (v == parseInt(v) && v > 0) {
          return true;
        } else {
          return "Integer greater than 0 required";
        }
      } else {
        if (v == parseInt(v)) {
          return true;
        } else {
          return "Integer required";
        }
      }
    },
    validateSupply() {
      // manually call validation
      this.$refs.supplyForm.validate();
    },
    validateDecimals() {
      // manually call validation
      this.$refs.decimalsForm.validate();
    },
    async createToken() {
      EventBus.$emit("busy", true);
      const privateKey = await Ed25519PrivateKey.generate();

      if ( ! this.freeze) {
        this.defaultFreezeStatus = false;
      }

      const ownerAccount = getAccountDetails("owner");
      const token = {
        name: this.name,
        symbol: this.symbol,
        decimals: (this.decimals === "") ? 0 : this.decimals,
        initialSupply: this.initialSupply,
        adminKey: (this.mutable === "yes") ? privateKey.toString() : undefined,
        kycKey: (this.kyc === "yes") ? privateKey.toString() : undefined,
        freezeKey: (this.freeze === "yes") ? privateKey.toString() : undefined,
        wipeKey: (this.wipe === "yes") ? privateKey.toString() : undefined,
        supplyKey: (this.variable === "variable") ? privateKey.toString() : undefined,
        defaultFreezeStatus: this.defaultFreezeStatus,
        autoRenewAccount: ownerAccount.accountId,
        treasury: ownerAccount.accountId,
        deleted: false
      };
      const newToken = await tokenCreate(token);
      if (typeof newToken.tokenId !== "undefined") {
        this.$store.commit("setToken", newToken);
        this.dialog = false;
      }
      EventBus.$emit("busy", false);
    },
    tokenCompliance() {
      let details = "";

      if (this.kyc === "yes") {
        details += "KYC";
      }
      if (this.wipe === "yes") {
        if (this.kyc === "yes") {
          details += ", ";
        }
        details += "Wipe";
      }
      if (this.freeze === "yes") {
        if ((this.kyc === "yes") || (this.wipe === "yes")) {
          details += ", ";
        }
        details += "Freeze (";
        if (this.defaultFreezeStatus) {
          details += "on";
        } else {
          details += "off";
        }
        details += " by default)";
      }

      if (details.length === 0) {
        details = "No compliance features were selected.";
      } else {
        details = "The following compliance features were selected: " + details + ".";
      }
      return details;
    },
    tokenDetails() {
      let details = "";

      if (this.fractional === "fractional") {
        details += "It will be fractional with " + this.decimals + " decimals, ";
      } else {
        details += "It will be non-fractional, ";
      }

      if (this.variable === "No") {
        details += " fixed";
      } else {
        details += " variable";
      }
      details += " with an initial supply of " + this.initialSupply + ".";

      return details;
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
