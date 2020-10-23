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

    <v-btn text @click="showUI('admin')">
      Admin
    </v-btn>
    <div v-if="numberOfAccounts !== 0">
      <v-btn text :disabled="numberOfTokens === 0" @click="showUI('wallet1')">
        {{ walletId1 }}
      </v-btn>

      <v-btn text  :disabled="numberOfTokens === 0" @click="showUI('wallet2')">
        {{ walletId2 }}
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <v-btn icon @click="showCreate()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-btn icon @click="nuke()">
      <v-icon>mdi-nuke</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import {getAccountDetails, notifySuccess} from "../utils";
import { EventBus } from "../eventBus";
export default {
  name: "Header",
  data: function() {
    return {
      numberOfAccounts: this.$store.getters.numberOfAccounts,
      numberOfTokens: this.$store.getters.numberOfTokens,
      walletId2: "",
      walletId1: "",
      interval: undefined,
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
        const wallet1 = getAccountDetails("wallet1");
        this.walletId1 = wallet1.accountId;
        const wallet2 = getAccountDetails("wallet2");
        this.walletId2 = wallet2.accountId;
      }
    },
    showCreate() {
      EventBus.$emit("tokenCreate", "");
    },
    showUI(ui) {
      EventBus.$emit("viewChange", ui);
    },
    nuke() {
      this.$store.commit("setPolling", false);
      EventBus.$emit("busy", true);
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
