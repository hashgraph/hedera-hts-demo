<template>
  <v-app-bar app color="primary" dark absolute>
    <div class="d-flex align-center">
      <v-img
        alt="Hedera Logo"
        class="shrink mr-2"
        contain
        src="../assets/logo.svg"
        transition="scale-transition"
        width="40"
      />
    </div>
    <div>Hedera Token Service Demo</div>

    <v-spacer></v-spacer>

    <div>
      <v-btn
          rounded
          :color="issuerButtonColor"
          @click="showUI('Issuer')"
      >
        Issuer ({{ walletIssuer }})
      </v-btn>
      <a class="mr-2" v-bind:href="'https://hashscan.io/' +  network + '/account/' + walletIssuer"
         target="_blank"><v-icon>mdi-open-in-new</v-icon></a>
    </div>

    <div v-if="numberOfAccounts !== 0" class="ma-2">
        <v-btn
            rounded
            :color="aliceButtonColor"
            :disabled="numberOfTokens === 0"
            @click="showUI('Alice')"
        >
          Alice ({{ walletId1 }})
        </v-btn>
        <a class="mr-2" v-bind:href="'https://hashscan.io/' +  network + '/account/' + walletId1"
           target="_blank"><v-icon>mdi-open-in-new</v-icon></a>

        <v-btn
          rounded
          :color="bobButtonColor"
          :disabled="numberOfTokens === 0"
          @click="showUI('Bob')"
        >
          Bob ({{ walletId2 }})
        </v-btn>
        <a v-bind:href="'https://hashscan.io/' +  network + '/account/' + walletId2"
           target="_blank"><v-icon>mdi-open-in-new</v-icon></a>
    </div>

    <v-spacer></v-spacer>

    <v-btn icon @click="showCreate()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-btn icon @click="showCompose()">
      <v-icon>mdi-music</v-icon>
    </v-btn>
    <v-btn icon @click="showTransactions()">
      <v-icon>mdi-download-network</v-icon>
    </v-btn>
    <v-btn icon class="ml-6" color="red" @click="nuke()">
      <v-icon>mdi-nuke</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<script>
import { getAccountDetails, notifySuccess } from "../utils";
import { EventBus } from "../eventBus";
export default {
  name: "Header",
  data: function() {
    return {
      numberOfAccounts: this.$store.getters.numberOfAccounts,
      numberOfTokens: this.$store.getters.numberOfTokens,
      walletId2: "",
      walletId1: "",
      walletIssuer: "",
      interval: undefined,
      issuerButtonColor: "success",
      aliceButtonColor: "primary",
      bobButtonColor: "primary",
      network: process.env.VUE_APP_NETWORK
    };
  },
  created() {
    // not clean but can't get VUEX to trigger a watch, this is a quick fix
    this.interval = setInterval(() => {
      this.getWalletIds();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getWalletIds() {
      this.numberOfAccounts = this.$store.getters.numberOfAccounts;
      this.numberOfTokens = this.$store.getters.numberOfTokens;

      if (this.numberOfAccounts === 4) {
        this.walletId1 = getAccountDetails("Alice").accountId;
        this.walletId2 = getAccountDetails("Bob").accountId;
        this.walletIssuer = getAccountDetails("Issuer").accountId;
      }
    },
    showCompose() {
      EventBus.$emit("tokenCompose", "");
    },
    showCreate() {
      EventBus.$emit("tokenCreate", "");
    },
    showUI(ui) {
      switch (ui) {
        case "Issuer":
          this.issuerButtonColor = "success";
          this.aliceButtonColor = "primary";
          this.bobButtonColor = "primary";
          break;
        case "Alice":
          this.issuerButtonColor = "primary";
          this.aliceButtonColor = "success";
          this.bobButtonColor = "primary";
          break;
        case "Bob":
          this.issuerButtonColor = "primary";
          this.aliceButtonColor = "primary";
          this.bobButtonColor = "success";
          break;
      }

      EventBus.$emit("viewChange", ui);
    },
    showTransactions() {
      EventBus.$emit("showTransactions", "");
    },
    nuke() {
      this.$store.commit("setPolling", false);
      EventBus.$emit("busy", true);
      EventBus.$emit("nuke", "");

      notifySuccess("Clearing demo. Please wait");
      setTimeout(() => {
        this.$store.commit("reset");
        this.$store.dispatch("setup");
        EventBus.$emit("viewChange", "Issuer");
      }, 3000);
    }
  }
};
</script>
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
