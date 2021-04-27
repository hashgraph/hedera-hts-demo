<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card :color="backgroundColor">
        <v-toolbar :color="headingColor" dark>
          <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-title class="white--text">{{
            token.tokenId
          }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-row v-if="token.isNFT">
            <v-col cols="12" v-if="token.fileStorageProtocol === 'HEDERA'">
              Token properties stored in Hedera File Id: {{ fileId }}
            </v-col>
            <v-col cols="12" v-if="token.fileStorageProtocol === 'IPFS'">
              Token properties stored in IPFS File Id: {{ fileId }}
            </v-col>
          </v-row>
          <v-row v-if="!token.isNFT" dense>
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
          <v-row dense>
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
          <v-row dense>
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

          <v-row dense>
            <v-col cols="4">
              <v-checkbox
                v-model="token.adminKey"
                label="Admin"
                dense
                disabled
                hide-details
              ></v-checkbox>
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="token.supplyKey"
                label="Change Supply"
                disabled
                dense
                hide-details
              ></v-checkbox>
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="token.kycKey"
                label="KYC"
                disabled
                dense
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="4">
              <v-checkbox
                v-model="token.wipeKey"
                label="Wipe"
                disabled
                dense
                hide-details
              ></v-checkbox>
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="token.freezeKey"
                label="Freeze"
                disabled
                dense
                hide-details
              ></v-checkbox>
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="token.defaultFreezeStatus"
                disabled
                label="Default Freeze"
                dense
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-container v-if="token.isNFT">
            <v-row
              dense
              align="center"
              justify="center"
              v-if="token.isNFT && !keyValues.length"
            >
              <v-progress-circular indeterminate></v-progress-circular>
              Waiting for file availability.
            </v-row>
            <v-container v-if="imageData">
              <v-row dense align="center" justify="center">
                <v-col cols="8">
                  <v-simple-table fixed-header height="200px">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">
                            Property
                          </th>
                          <th class="text-left">
                            value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="keyValue in keyValues" :key="keyValue.key">
                          <td class="text-left">{{ keyValue.key }}</td>
                          <td class="text-left">{{ keyValue.value }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="4">
                  <v-img v-if="imageData" :src="imageData" width="100%"></v-img>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-else>
              <v-row dense>
                <v-col cols="12">
                  <v-simple-table fixed-header height="200px">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">
                            Property
                          </th>
                          <th class="text-left">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="keyValue in keyValues" :key="keyValue.key">
                          <td class="text-left">{{ keyValue.key }}</td>
                          <td class="text-left">{{ keyValue.value }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
              </v-row>
            </v-container>
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
import { fileGetContents } from "@/service/fileService";

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
      autoRenewPeriod: "",
      headingColor: "primary",
      title: "",
      backgroundColor: "white",
      properties: "",
      imageData: undefined,
      keyValues: [],
      fileId: ""
    };
  },
  created() {
    const vm = this;
    EventBus.$on("tokenDetails", async function(value) {
      vm.dialog = true;
      vm.token = value;
      vm.supply = amountWithDecimals(value.totalSupply, value.decimals);
      vm.expiry = value.expiry;
      vm.autoRenewPeriod = secondsToParts(value.autoRenewPeriod);
      vm.headingColor = value.isNFT ? "" : "primary";
      vm.title = value.isNFT
        ? value.name
        : value.name + " (" + value.symbol + ")";
      vm.backgroundColor = value.isDeleted ? "red" : "white";
      vm.fileStorageProtocol = value.fileStorageProtocol;
      vm.keyValues = [];
      if (value.isNFT) {
        if (value.fileStorageProtocol === "HEDERA") {
          // get file from Hedera
          vm.fileId = value.symbol.replace("HEDERA://", "");
          const fileData = await fileGetContents(vm.fileId);
          const fileDataString = new TextDecoder().decode(fileData);
          const tokenProperties = JSON.parse(fileDataString);
          if (tokenProperties.photo) {
            vm.imageData = tokenProperties.photo;
            delete tokenProperties.photo;
          }
          for (const key in tokenProperties) {
            vm.keyValues.push({ key: key, value: tokenProperties[key] });
          }
        } else if (value.fileStorageProtocol === "IPFS") {
          vm.fileId = value.symbol.replace("IPFS://", "");
          const fileData = await fileGetContents(vm.fileId, "IPFS");
          const tokenProperties = await fileData.json();

          if (tokenProperties.photo) {
            vm.imageData = tokenProperties.photo;
            delete tokenProperties.photo;
          }
          for (const key in tokenProperties) {
            vm.keyValues.push({ key: key, value: tokenProperties[key] });
          }
        }
      }
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
