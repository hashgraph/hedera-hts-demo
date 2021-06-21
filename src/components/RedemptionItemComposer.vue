<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-toolbar>
        <v-tabs centered v-model="tabs">
          <v-tab>Redeemable Item</v-tab>
        </v-tabs>
      </v-toolbar>
      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-container>
            <v-stepper v-model="step" alt-labels>
              <v-stepper-header>
                <v-stepper-step :complete="step > STEP_NAME" :step="STEP_NAME">
                  Name
                </v-stepper-step>
                <v-divider></v-divider>

                <v-stepper-step
                  :complete="step > STEP_PROPERTIES"
                  :step="STEP_PROPERTIES"
                >
                  Properties
                </v-stepper-step>
                <v-divider></v-divider>

                <v-stepper-step
                  :complete="step > STEP_CREATE"
                  :step="STEP_CREATE"
                >
                  Create
                </v-stepper-step>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content :step="STEP_NAME">
                  <v-card class="mb-12" :height="cardHeight" flat>
                    <v-card-text>
                      <v-form ref="nameForm" v-model="nameValid">
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              label="Name*"
                              :rules="nameRules"
                              v-model="itemName"
                              required
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                  </v-card>
                  <v-row>
                    <v-col>
                      <v-btn text @click="cancel"> Cancel</v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col>
                      <v-btn
                        color="primary"
                        @click="nextStep"
                        :disabled="!nameValid"
                      >
                        Continue
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-stepper-content>

                <v-stepper-content :step="STEP_PROPERTIES">
                  <v-card class="mb-12" :height="cardHeight" flat>
                    <v-card-text>
                      <v-form ref="selectTokensForm">
                        <v-row v-for="token in tokens" :key="token.tokenId">
                          <v-col cols="12" sm="4" md="4">
                            <v-checkbox
                              v-model="tokensEnabled[token.tokenId]"
                              class="ex4"
                              hide-details
                            >
                              <template v-slot:label>
                                {{ token.name }} ({{ token.symbol }})
                              </template>
                            </v-checkbox>
                            <v-text-field
                              :disabled="!tokensEnabled[token.tokenId]"
                              :label="`Price in ${token.symbol}`"
                              v-model="tokensEnabledPrice[token.tokenId]"
                              type="number"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                  </v-card>
                  <v-row>
                    <v-col>
                      <v-btn text @click="cancel"> Cancel</v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col>
                      <v-btn
                        color="primary"
                        @click="nextStep"
                        :disabled="!nameValid"
                      >
                        Continue
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-stepper-content>

                <v-stepper-content :step="STEP_CREATE">
                  <v-card class="mb-12" :height="cardHeight" flat>
                    <v-card-title
                      >You're about to create a redeemable item for the
                      marketplace
                      {{ itemName }}
                    </v-card-title>
                  </v-card>

                  <v-row>
                    <v-col>
                      <v-btn text @click="cancel"> Cancel</v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col>
                      <v-btn text class="mr-2" @click="backStep"> Back</v-btn>
                      <v-btn color="primary" @click="createRedeemableItem()">
                        Proceed
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "@/eventBus";
import { getAccountDetails } from "@/utils";
import { PrivateKey } from "@hashgraph/sdk";
import { tokenCreate } from "@/service/tokenService";
import "@koumoul/vjsf/lib/VJsf.css";
import "@koumoul/vjsf/lib/deps/third-party.js";
import { fileCreate } from "@/service/fileService";

export default {
  name: "RedemptionItemComposer",
  data: function() {
    return {
      STEP_NAME: 1,
      STEP_PROPERTIES: 2,
      STEP_CREATE: 3,
      nameValid: false,
      step: 1,
      kyc: "yes",
      freeze: "yes",
      photoSize: 0,
      isHederaFileService: false,
      cardHeight: 300,
      NFT_STORAGE_API_KEY: process.env.VUE_APP_NFT_STORAGE_API_KEY,
      nameRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
      ],
      itemName: "",
      symbol: "",
      defaultFreezeStatus: false,
      ///
      valid: false,
      model: {},
      schema: {
        type: "object",
        properties: {}
      },
      tokenTemplates: {},
      tokenTemplate: "",
      tokenTemplatesForSelection: [],
      dialog: false,
      tabs: null,

      tokensToAccept: [],
      tokensEnabled: [],
      tokensEnabledPrice: []
    };
  },
  created() {
    this.init();
    EventBus.$on("redeemableItemDialog", () => {
      this.dialog = true;
    });
    EventBus.$on("dialogClose", () => {
      this.dialog = false;
    });

    this.loadTokens();

    EventBus.$on("tokenCreateLoyalty", () => {
      this.loadTokens();
      this.$forceUpdate();
    });
    EventBus.$on("tokenCreate", () => {
      this.loadTokens();
      this.$forceUpdate();
    });
  },
  computed: {
    imageData() {
      return this.imageBase64();
    }
  },
  methods: {
    init() {
      this.nameValid = false;
      this.step = 1;
      //
      this.itemName = "";
      this.tokensEnabled = [];
      this.tokensEnabledPrice = [];

      for (const templateItem in this.tokenTemplates) {
        if (templateItem !== "helpCompletingThisFile") {
          this.tokenTemplatesForSelection.push(templateItem);
        }
      }
    },
    loadTokens() {
      this.loading = true;
      this.tokens = [];

      for (const token in this.$store.getters.getTokens) {
        this.tokens.push(this.$store.getters.getTokens[token]);
      }

      this.loading = false;
    },
    imageBase64() {
      this.photoSize = 0;
      if (typeof this.model.photo === "undefined") {
        return undefined;
      }
      if (typeof this.model.photo.type === "undefined") {
        return undefined;
      }
      if (typeof this.model.photo.data === "undefined") {
        return undefined;
      }
      this.photoSize = this.model.photo.size;
      return (
        "data:" + this.model.photo.type + ";base64," + this.model.photo.data
      );
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
    async createRedeemableItem() {
      EventBus.$emit("busy", true);

      const redeemableItem = {};
      redeemableItem.itemName = this.itemName;
      redeemableItem.tokensEnabled = {};

      const enabledTokenIds = Object.keys(this.tokensEnabled);

      enabledTokenIds.forEach(tokenId => {
        const isEnabled = this.tokensEnabled[tokenId];
        if (isEnabled)
          redeemableItem.tokensEnabled[tokenId] = Number(
            this.tokensEnabledPrice[tokenId]
          );
      });

      this.$store.commit("addRedeemableItem", redeemableItem);

      EventBus.$emit("dialogClose");

      console.log(this.$store.getters.getRedeemableItems);

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
      const fileId = await fileCreate(
        JSON.stringify(modelToSave),
        this.model.Storage
      );
      if (fileId !== "") {
        const issuerAccount = getAccountDetails("Issuer");

        const token = {
          name: this.name,
          symbol:
            (this.model.Storage === "HEDERA" ? "hedera://" : "ipfs://") +
            fileId,
          decimals: 0,
          initialSupply: 1,
          adminKey: this.wipe === "yes" ? privateKey.toString() : undefined,
          kycKey: this.kyc === "yes" ? privateKey.toString() : undefined,
          freezeKey: this.freeze === "yes" ? privateKey.toString() : undefined,
          wipeKey: this.wipe === "yes" ? privateKey.toString() : undefined,
          supplyKey: undefined,
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

html {
  overflow: hidden !important;
}
</style>
