<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-toolbar color="primary" dark>
        <v-toolbar-title class="white--text">Token Composer</v-toolbar-title>
      </v-toolbar>
      <v-stepper v-model="step" alt-labels>
        <v-stepper-header>
          <v-stepper-step :complete="step > STEP_TYPE" :step="STEP_TYPE">
            Type
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > STEP_NAME" :step="STEP_NAME">
            Name
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="step > STEP_FRACTIONAL"
            :step="STEP_FRACTIONAL"
          >
            Fractional
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > STEP_SUPPLY" :step="STEP_SUPPLY">
            Supply
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > STEP_MUTABLE" :step="STEP_MUTABLE">
            Mutable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > STEP_KYC" :step="STEP_KYC">
            KYC
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="step > STEP_WIPEABLE"
            :step="STEP_WIPEABLE"
          >
            Wipeable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="step > STEP_FREEZABLE"
            :step="STEP_FREEZABLE"
          >
            Freezable
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > STEP_CREATE" :step="STEP_CREATE">
            Create
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content :step="STEP_TYPE">
            <v-card class="mb-12" height="200px">
              <v-form ref="fungibleForm">
                <v-radio-group v-model="fungible">
                  <v-radio
                    name="fungible"
                    label="Fungible"
                    value="yes"
                  ></v-radio>
                  <v-radio
                    name="fungible"
                    label="Non Fungible"
                    value="no"
                  ></v-radio>
                </v-radio-group>
              </v-form>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn color="primary" @click="nextStep">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>
          <v-stepper-content :step="STEP_NAME">
            <v-card class="mb-12" height="200px">
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
                  <v-col cols="6">
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
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="nextStep" :disabled="!nameValid">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_FRACTIONAL">
            <v-card class="mb-12" height="200px">
              <v-form
                v-if="fungible === 'yes'"
                ref="decimalsForm"
                v-model="decimalsValid"
              >
                <v-radio-group v-model="fractional">
                  <v-radio
                    name="fractional"
                    label="Whole"
                    value="no"
                    @click="validateDecimals()"
                  ></v-radio>
                  <v-radio
                    name="fractional"
                    label="Fractional"
                    value="yes"
                    @click="validateDecimals()"
                  ></v-radio>
                </v-radio-group>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-if="fractional === 'yes'"
                      label="Decimals*"
                      required
                      v-model="decimals"
                      :rules="decimalsRules"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
              <v-form v-else ref="decimalsForm" v-model="decimalsValid">
                <v-radio-group v-model="fractional">
                  <v-radio
                    name="fractional"
                    label="Singleton"
                    value="no"
                  ></v-radio>
                </v-radio-group>
              </v-form>
            </v-card>
            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep"
                  :disabled="!decimalsValid && fractional === 'yes'"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_SUPPLY">
            <v-card class="mb-12" height="200px">
              <v-form
                v-if="fungible === 'yes'"
                ref="supplyForm"
                v-model="supplyValid"
              >
                <v-radio-group v-model="variable">
                  <v-radio
                    name="variable"
                    label="Variable"
                    value="yes"
                    @click="validateSupply()"
                  ></v-radio>
                  <v-radio
                    name="variable"
                    label="Fixed"
                    value="no"
                    @click="validateSupply()"
                  ></v-radio>
                </v-radio-group>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      label="Initial Supply*"
                      required
                      v-model="initialSupply"
                      :rules="[supplyRule]"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
              <v-form v-else>
                <v-radio-group v-model="variable">
                  <v-radio name="variable" label="Fixed" value="no"></v-radio>
                </v-radio-group>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      label="Initial Supply*"
                      required
                      disabled
                      value="1"
                      v-model="initialSupply"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep"
                  :disabled="!supplyValid && this.fungible === 'yes'"
                >
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_MUTABLE">
            <v-card class="mb-12" height="200px">
              <v-radio-group v-model="mutable">
                <v-radio name="admin" label="No" value="no"></v-radio>
                <v-radio name="admin" label="Yes" value="yes"></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_KYC">
            <v-card class="mb-12" height="200px">
              <v-radio-group v-model="kyc">
                <v-radio name="kyc" label="No" value="no"></v-radio>
                <v-radio name="kyc" label="Yes" value="yes"></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_WIPEABLE">
            <v-card class="mb-12" height="200px">
              <v-radio-group v-model="wipe">
                <v-radio name="wipe" label="No" value="no"></v-radio>
                <v-radio
                  v-if="fungible === 'yes'"
                  name="wipe"
                  label="Yes"
                  value="yes"
                ></v-radio>
              </v-radio-group>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_FREEZABLE">
            <v-card class="mb-12" height="200px">
              <v-radio-group v-model="freeze">
                <v-radio name="freeze" label="No" value="no"></v-radio>
                <v-radio name="freeze" label="Yes" value="yes"></v-radio>
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
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="nextStep">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content :step="STEP_CREATE">
            <v-card class="mb-12" height="200px">
              <v-card-title v-if="fungible === 'yes'"
                >You're about to create a fungible token named {{ name }} ({{
                  symbol.toUpperCase()
                }})</v-card-title
              >
              <v-card-title v-else
                >You're about to create a non fungible token named
                {{ name }} ({{ symbol.toUpperCase() }})</v-card-title
              >
              <v-card-text align="left">
                <P>{{ tokenDetails() }}</P>
                <P>{{ tokenCompliance() }}</P>
                <P v-if="mutable === 'yes'"
                  >An admin key will be able to update it.</P
                >
                <P v-else>It will be immutable.</P>
                <P>{{ tokenUsages() }}</P>
              </v-card-text>
            </v-card>

            <v-row>
              <v-col>
                <v-btn text @click="dialog = false">
                  Cancel
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn text class="mr-2" @click="backStep">
                  Back
                </v-btn>
                <v-btn color="primary" @click="createToken()">
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
import { getAccountDetails } from "@/utils";
import { PrivateKey } from "@hashgraph/sdk";
import { tokenCreate } from "@/service/tokenService";

export default {
  name: "Composer",
  data: function() {
    return {
      STEP_TYPE: 1,
      STEP_NAME: 2,
      STEP_FRACTIONAL: 3,
      STEP_SUPPLY: 4,
      STEP_MUTABLE: 5,
      STEP_KYC: 6,
      STEP_WIPEABLE: 7,
      STEP_FREEZABLE: 8,
      STEP_CREATE: 9,
      fungible: "yes",
      nameValid: false,
      decimalsValid: false,
      supplyValid: false,
      dialog: false,
      step: 1,
      fractional: "no",
      variable: "yes",
      mutable: "yes",
      kyc: "yes",
      wipe: "yes",
      freeze: "yes",
      decimalsRules: [
        v => (v == parseInt(v) && v > 0) || "Integer greater than 0 required"
      ],
      textRules: [v => !!v || "Input required"],
      textOnlyRules: [
        v => !!v || "Input required",
        v => /^[a-zA-Z]*$/.test(v) || "Only letters are allowed"
      ],
      name: "",
      symbol: "",
      decimals: "",
      initialSupply: "",
      defaultFreezeStatus: false
    };
  },
  created() {
    EventBus.$on("tokenCompose", () => {
      this.dialog = true;
      this.nameValid = false;
      this.decimalsValid = false;
      this.supplyValid = false;
      this.fractional = "no";
      this.variable = "yes";
      this.mutable = "yes";
      this.kyc = "yes";
      this.wipe = "yes";
      this.freeze = "yes";
      this.step = 1;
      //
      this.name = "";
      this.symbol = "";
      this.decimals = "";
      this.initialSupply = "";
      this.defaultFreezeStatus = false;
    });
  },
  computed: {},
  methods: {
    nextStep() {
      if (this.step === this.STEP_TYPE && this.fungible === "no") {
        this.initialSupply = 1;
        this.variable = "no";
        this.decimals = 0;
        this.wipe = "no";
      }
      this.step = this.step + 1;
    },
    backStep() {
      this.step = this.step - 1;
    },
    supplyRule(v) {
      if (this.variable === "no") {
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
      const privateKey = await PrivateKey.generate();

      if (!this.freeze) {
        this.defaultFreezeStatus = false;
      }

      const ownerAccount = getAccountDetails("owner");
      const token = {
        name: this.name,
        symbol: this.symbol,
        decimals: this.decimals === "" ? 0 : this.decimals,
        initialSupply: this.initialSupply,
        adminKey: this.mutable === "yes" ? privateKey.toString() : undefined,
        kycKey: this.kyc === "yes" ? privateKey.toString() : undefined,
        freezeKey: this.freeze === "yes" ? privateKey.toString() : undefined,
        wipeKey: this.wipe === "yes" ? privateKey.toString() : undefined,
        supplyKey: this.variable === "yes" ? privateKey.toString() : undefined,
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
    tokenUsages() {
      let details = "";
      if (this.fungible === "yes") {
        if (this.fractional === "yes") {
          if (this.variable === "yes") {
            // fungible, fractional, variable
            details = "It could be used as a currency.";
          } else {
            // fungible, fractional, fixed
            details = "It could be used for an ICO.";
          }
        } else {
          if (this.variable === "yes") {
            // fungible, whole, variable
            details =
              "It could be used as a stock keeping unit, stock or loyalty.";
          } else {
            // fungible, whole, fixed
            details = "It could be used as a bond.";
          }
        }
      } else {
        details = "It could be used as deed or title.";
      }

      return details;
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
        if (this.kyc === "yes" || this.wipe === "yes") {
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
        details =
          "The following compliance features were selected: " + details + ".";
      }
      return details;
    },
    tokenDetails() {
      let details = "";

      if (this.fractional === "yes") {
        details += "It will be fractional with " + this.decimals + " decimals ";
      } else {
        details += "It will be non-fractional ";
      }

      if (this.variable === "yes") {
        details += " and variable";
      } else if (this.fungible === "no") {
        details += " and whole";
      } else {
        details += "and variable";
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
