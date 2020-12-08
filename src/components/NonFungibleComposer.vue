<template>
  <v-stepper v-model="step" alt-labels>
    <v-stepper-header>
      <v-stepper-step :complete="step > STEP_NAME" :step="STEP_NAME">
        Name
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_PROPERTIES" :step="STEP_PROPERTIES">
        Properties
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > STEP_KYC" :step="STEP_KYC">
        KYC
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
            <v-btn color="primary" @click="nextStep" :disabled="!nameValid">
              Continue
            </v-btn>
          </v-col>
        </v-row>
      </v-stepper-content>

      <v-stepper-content :step="STEP_PROPERTIES">
        <v-card class="mb-12" height="200px" flat>
          <v-card-text>
            <v-row>
              <v-col v-if="schema.properties.photo" cols="8">
                <v-form v-model="valid">
                  <v-jsf v-model="model" :schema="schema"/>
                </v-form>
              </v-col>
              <v-col v-else cols="12">
                <v-form v-model="valid">
                  <v-jsf v-model="model" :schema="schema"/>
                </v-form>
              </v-col>
              <v-col v-if="imageData" cols="4">
                <img v-if="imageData" :src="imageData" width="100%">
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
          <v-card-title
            >You're about to create a non fungible token named
            {{ name }}</v-card-title
          >
          <v-card-text align="left">
            <P>{{ tokenDetails() }}</P>
            <P>{{ tokenCompliance() }}</P>
            <P>It will be immutable and could be used as a deed or title.</P>
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
import { PrivateKey } from "@hashgraph/sdk";
import { tokenCreate } from "@/service/tokenService";
import VJsf from '@koumoul/vjsf/lib/VJsf.js';
import '@koumoul/vjsf/lib/VJsf.css';
import '@koumoul/vjsf/lib/deps/third-party.js';
import {fileCreate} from "@/service/fileService";

export default {
  name: "NonFungibleComposer",
  components: { VJsf },
  data: function() {
    return {
      STEP_NAME: 1,
      STEP_PROPERTIES: 2,
      STEP_KYC: 3,
      STEP_FREEZABLE: 4,
      STEP_CREATE: 5,
      nameValid: false,
      step: 1,
      kyc: "yes",
      freeze: "yes",
      nameRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
      ],
      name: "",
      symbol: "",
      defaultFreezeStatus: false,
      ///
      valid: false,
      model: {},
      schema: {
        type: 'object',
        properties: {
          dominantColor: {
            type: 'string',
            title: "Dominant Skin Color",
            enum: [
                "green", "brown", "red", "blue"
            ]
          },
          otherColor: {
            type: 'string',
            title: "Other Skin Color",
            enum: [
              "green", "brown", "red", "blue"
            ]
          },
          adultSize: {
            type: 'string',
            title: "Adult size",
            enum: [
              "tiny", "small", "medium", "large"
            ]
          },
          eyeShape: {
            type: 'string',
            title: "Shape of my eyes",
            enum: [
              "oval", "round", "square"
            ]
          },
          dangerLevel: {
            type: 'string',
            title: "Am I dangerous to humans",
            enum: [
              "a bit slimy", "poisonous", "lethal"
            ]
          },
          photo: {
            type: "object",
            title: "photo",
            contentMediaType: "image/*",
            writeOnly: true,
            properties: {
              type: {
                type: "string"
              },
              data: {
                type: "string"
              }
            }
          },
          },
        }
      }
  },
  created() {
    EventBus.$on("tokenCompose", () => {
      this.nameValid = false;
      this.kyc = "yes";
      this.freeze = "yes";
      this.step = 1;
      //
      this.name = "";
      this.symbol = "";
      this.defaultFreezeStatus = false;
    })
  },
  computed: {
    imageData() {
      return this.imageBase64();
    }
  },
  methods: {
    imageBase64() {
      if (typeof this.model.photo === "undefined") {
        return undefined;
      }
      if (typeof this.model.photo.type === "undefined") {
        return undefined;
      }
      if (typeof this.model.photo.data === "undefined") {
        return undefined;
      }
      return "data:" + this.model.photo.type + ";base64," + this.model.photo.data;
    },
    nextStep() {
      this.step = this.step + 1;
    },
    backStep() {
      this.step = this.step - 1;
    },
    cancel() {
      EventBus.$emit("busy", false);
    },
    async createToken() {
      EventBus.$emit("busy", true);
      const privateKey = await PrivateKey.generate();

      if (!this.freeze) {
        this.defaultFreezeStatus = false;
      }

      // create an immutable file with the token properties
      let modelToSave = this.model;
      if (typeof this.imageBase64() !== "undefined") {
        modelToSave.photo = this.imageBase64();
      }
      const fileId = await fileCreate(JSON.stringify(modelToSave));
      if (fileId !== "") {
        const ownerAccount = getAccountDetails("owner");

        const token = {
          name: this.name,
          symbol: "hedera://" + fileId,
          decimals: 0,
          initialSupply: 1,
          adminKey: undefined,
          kycKey: this.kyc === "yes" ? privateKey.toString() : undefined,
          freezeKey: this.freeze === "yes" ? privateKey.toString() : undefined,
          wipeKey:  undefined,
          supplyKey: undefined,
          defaultFreezeStatus: this.defaultFreezeStatus,
          autoRenewAccount: ownerAccount.accountId,
          treasury: ownerAccount.accountId,
          deleted: false,
          key: privateKey.toString()
        };
        const newToken = await tokenCreate(token);
        if (typeof newToken.tokenId !== "undefined") {
          this.$store.commit("setToken", newToken);
        }
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
      let details = "It will be non-fractional with a fixed supply of 1.";
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
html {
  overflow: hidden !important;
}

.v-card {
  display: flex !important;
  flex-direction: column;
}

.v-card__text {
  flex-grow: 1;
  overflow: auto;
}
</style>
