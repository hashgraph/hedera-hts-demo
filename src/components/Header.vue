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

    <v-btn
      class="ma-2"
      rounded
      :color="ownerButtonColor"
      @click="showUI('admin')"
    >
      {{ walletOwner }} (Owner)
    </v-btn>
    <div v-if="numberOfAccounts !== 0">
      <v-btn
        class="ma-2"
        rounded
        :color="wallet1ButtonColor"
        :disabled="numberOfTokens === 0"
        @click="showUI('wallet1')"
      >
        {{ walletId1 }}
      </v-btn>
      <v-btn
        class="ma-2"
        rounded
        :color="wallet2ButtonColor"
        :disabled="numberOfTokens === 0"
        @click="showUI('wallet2')"
      >
        {{ walletId2 }}
      </v-btn>
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
      walletOwner: "",
      interval: undefined,
      ownerButtonColor: "success",
      wallet1ButtonColor: "primary",
      wallet2ButtonColor: "primary"
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

      if (this.numberOfAccounts === 3) {
        this.walletId1 = getAccountDetails("wallet1").accountId;
        this.walletId2 = getAccountDetails("wallet2").accountId;
        this.walletOwner = getAccountDetails("owner").accountId;
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
        case "admin":
          this.ownerButtonColor = "success";
          this.wallet1ButtonColor = "primary";
          this.wallet2ButtonColor = "primary";
          break;
        case "wallet1":
          this.ownerButtonColor = "primary";
          this.wallet1ButtonColor = "success";
          this.wallet2ButtonColor = "primary";
          break;
        case "wallet2":
          this.ownerButtonColor = "primary";
          this.wallet1ButtonColor = "primary";
          this.wallet2ButtonColor = "success";
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
        EventBus.$emit("viewChange", "admin");
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
