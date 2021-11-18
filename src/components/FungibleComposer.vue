<template>
  <v-stepper v-model="step" alt-labels>
    <v-stepper-header>
      <v-stepper-step :complete="step > STEP_NAME" :step="STEP_NAME">
        Name
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_FRACTIONAL" :step="STEP_FRACTIONAL">
        Fractional
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_SUPPLY" :step="STEP_SUPPLY">
        Supply
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_CUSTOMFEES" :step="STEP_CUSTOMFEES">
        Custom Fees
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
      <v-stepper-step :complete="step > STEP_WIPEABLE" :step="STEP_WIPEABLE">
        Wipeable
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_FREEZABLE" :step="STEP_FREEZABLE">
        Freezable
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_CREATE" :step="STEP_CREATE">
        Create
      </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content :step="STEP_NAME">
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-form ref="nameForm" v-model="nameValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Name*"
                    :rules="nameRules"
                    v-model="name"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Symbol*"
                    :rules="symbolRules"
                    v-model="symbol"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
        <v-row>
          <v-col>
            <v-btn text @click="cancel">
              Cancel
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn color="primary" @click="nextStep" :disabled="!nameValid">
              Continue
            </v-btn>
          </v-col>
        </v-row>
      </v-stepper-content>

      <v-stepper-content :step="STEP_FRACTIONAL">
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-form ref="decimalsForm" v-model="decimalsValid">
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
                    :rules="integerRules"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
        <v-row>
          <v-col>
            <v-btn text @click="cancel">
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
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-form ref="supplyForm" v-model="supplyValid">
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
          </v-card-text>
        </v-card>

        <v-row>
          <v-col>
            <v-btn text @click="cancel">
              Cancel
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn text class="mr-2" @click="backStep">
              Back
            </v-btn>
            <v-btn color="primary" @click="nextStep" :disabled="!supplyValid">
              Continue
            </v-btn>
          </v-col>
        </v-row>
      </v-stepper-content>

      <v-stepper-content :step="STEP_CUSTOMFEES">
          <v-card class="mb-12" :height="cardHeight" flat>
            <v-card-text>
              <v-form ref="customFeeForm" v-model="customFeeValid">
                <v-row>
                  <v-col cols="12">
                    Custom fees are fees that are distributed to the specified
                    accounts each time the token is transferred
                    programmatically.
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-radio-group v-model="customFeeSelected">
                      <v-radio
                        name="customFeeSelected"
                        label="No Custom Fees"
                        value=" "
                      ></v-radio>
                      <v-radio
                        name="customFeeSelected"
                        label="Fixed"
                        value="fixed"
                      ></v-radio>
                      <v-radio
                        name="customFeeSelected"
                        label="Royalty"
                        value="royalty"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="5">
                    <v-text-field
                      v-if="customFeeSelected === 'fixed'"
                      label="Fixed Fee*"
                      :rules="customFeeRules"
                      v-model="customFees"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-if="customFeeSelected === 'royalty'"
                      label="numerator*"
                      required
                      v-model="customFeeNumerator"
                      :rules="numeratorRules"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-if="customFeeSelected === 'royalty'"
                      label="denominator*"
                      required
                      v-model="customFeeDenominator"
                      :rules="denominatorRules"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form> 
            </v-card-text>
          </v-card>
          <v-row>
            <v-col>
              <v-btn text @click="cancel"> Cancel </v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col>
              <v-btn
                color="primary"
                @click="nextStep"
                :disabled="!customFeeValid"
              >
                Continue
              </v-btn>
            </v-col>
          </v-row>
        </v-stepper-content>

      <v-stepper-content :step="STEP_MUTABLE">
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-radio-group v-model="mutable">
              <v-radio name="admin" label="No" value="no"></v-radio>
              <v-radio name="admin" label="Yes" value="yes"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col>
            <v-btn text @click="cancel">
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
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-radio-group v-model="kyc">
              <v-radio name="kyc" label="No" value="no"></v-radio>
              <v-radio name="kyc" label="Yes" value="yes"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col>
            <v-btn text @click="cancel">
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
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-radio-group v-model="wipe">
              <v-radio name="wipe" label="No" value="no"></v-radio>
              <v-radio name="wipe" label="Yes" value="yes"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col>
            <v-btn text @click="cancel">
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
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
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
          </v-card-text>
        </v-card>

        <v-row>
          <v-col>
            <v-btn text @click="cancel">
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
        <v-card class="mb-12" height="200px" flat>
          <v-card-title>
            You're about to create a fungible common token named {{ name }} ({{
              symbol.toUpperCase()
            }})
          </v-card-title>
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
            <v-btn text @click="cancel">
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
</template>

<script>
import { EventBus } from "../eventBus";
import { getAccountDetails } from "@/utils";
import { PrivateKey, TokenType } from "@hashgraph/sdk";
import { tokenCreate } from "@/service/tokenService";

export default {
  name: "FungibleComposer",
  data: function() {
    return {
      STEP_NAME: 1,
      STEP_FRACTIONAL: 2,
      STEP_SUPPLY: 3,
      STEP_CUSTOMFEES: 4,
      STEP_MUTABLE: 5,
      STEP_KYC: 6,
      STEP_WIPEABLE: 7,
      STEP_FREEZABLE: 8,
      STEP_CREATE: 9,
      nameValid: false,
      decimalsValid: false,
      supplyValid: false,
      step: 1,
      fractional: "no",
      variable: "yes",
      mutable: "yes",
      kyc: "yes",
      wipe: "yes",
      freeze: "yes",
      integerRules: [
        v => (v == parseInt(v) && v > 0) || "Integer greater than 0 required"
      ],
      nameRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
      ],
      customFeeRules: [
        (n) => !!n || "Please enter an integer",
        (n) => !isNaN(parseInt(n)) || "Please enter a number",
      ],
      symbolRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
      ],
      customFeeOptions: ["Fixed", "Fractional", "Royalty"],
      selectedFeeOption: "",
      name: "",
      customFees: 0,
      customFeeSelected: "fixed",
      customFeeNumerator: 0,
      customFeeDenominator: 0,
      symbol: "",
      decimals: "",
      initialSupply: 0,
      defaultFreezeStatus: false
    };
  },
  created() {
    this.init();
    EventBus.$on("tokenCompose", () => {
      this.init();
    });
  },
  computed: {},
  methods: {
    init() {
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
      this.tokenType = TokenType.FungibleCommon,
      this.symbol = "";
      this.decimals = "";
      this.initialSupply = "0";
      this.defaultFreezeStatus = false;
      this.customFees = 0;
      this.customFeeNumerator = 0;
      this.customFeeDenominator = 0;
      this.customFeesSelected = "";
    },
    nextStep() {
      this.step = this.step + 1;
    },
    backStep() {
      this.step = this.step - 1;
    },
    cancel() {
      EventBus.$emit("dialogClose");
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

      const issuerAccount = getAccountDetails("Issuer");
      const token = {
        name: this.name,
        tokenType: TokenType.FungibleCommon,
        symbol: this.symbol,
        decimals: this.decimals === "" ? 0 : this.decimals,
        initialSupply: this.initialSupply,
        customFees: this.customFees,
        customFeeNumerator: this.customFeeNumerator,
        customFeeDenominator: this.customFeeDenominator,
        customFeeSelected: this.customFeeSelected,
        adminKey: this.mutable === "yes" ? privateKey.toString() : undefined,
        kycKey: this.kyc === "yes" ? privateKey.toString() : undefined,
        freezeKey: this.freeze === "yes" ? privateKey.toString() : undefined,
        wipeKey: this.wipe === "yes" ? privateKey.toString() : undefined,
        supplyKey: this.variable === "yes" ? privateKey.toString() : undefined,
        defaultFreezeStatus: this.defaultFreezeStatus,
        autoRenewAccount: issuerAccount.accountId,
        treasury: issuerAccount.accountId,
        deleted: false,
        key: privateKey.toString()
      };
      const newToken = await tokenCreate(token);
      if (typeof newToken.tokenId !== "undefined") {
        this.$store.commit("setToken", newToken);
        EventBus.$emit("dialogClose");
      }
      EventBus.$emit("busy", false);
    },
    tokenUsages() {
      let details = "";
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

      return details;
    },
    tokenCompliance() {
      let details = "";
      details += this.kyc === "yes" ? "KYC" : "";

      if (this.wipe === "yes") {
        details += this.kyc === "yes" ? ", Wipe" : "Wipe";
      }
      if (this.freeze === "yes") {
        if (this.kyc === "yes" || this.wipe === "yes") {
          details += ", ";
        }
        details += "Freeze (" + this.defaultFreezeStatus ? "on" : "off";
        details += " by default)";
      }

      return details.length === 0
        ? "No compliance features were selected."
        : "The following compliance features were selected: " + details + ".";
    },
    tokenDetails() {
      let details =
        this.fractional === "yes"
          ? "It will be fractional with " + this.decimals + " decimals "
          : "It will be non-fractional ";
      details += this.variable === "yes" ? " and variable" : "and fixed";
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
