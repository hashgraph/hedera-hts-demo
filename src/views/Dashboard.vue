<template>
  <div>
    <v-overlay :value="busy">
      <v-progress-circular
        v-if="busy"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </v-overlay>
    <div v-if="showUI === 'Issuer'">
      <div v-if="currentTokenId"><Accounts /></div>
      <div v-else><Tokens /></div>
    </div>
    <div v-else>
      <Wallet v-bind:walletInstance="showUI" :key="walletKey" />
    </div>
    <TokenDetailsDialog />
    <TokenCreateDialog />
    <MintBurnDialog />
    <TransferDialog />
    <ComposerDialog />
    <TransactionsDrawer />
    <ErrorNoEnvFilePopup />
    <v-footer :color="footerColor" absolute class="font-weight-medium" padless>
      <v-card flat tile width="100%" :class="footerColor">
        <v-card-text :class="textColor">
          <strong>{{ message }}</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </div>
</template>

<script>
import Tokens from "../components/Tokens";
import Accounts from "../components/Accounts";
import Wallet from "../components/Wallet";
import { EventBus } from "../eventBus";
import TokenDetailsDialog from "../components/TokenDetailsDialog";
import MintBurnDialog from "../components/MintBurnDialog";
import TokenCreateDialog from "../components/TokenCreateDialog";
import TransferDialog from "../components/TransferDialog";
import TransactionsDrawer from "@/components/TransactionsDrawer";
import ComposerDialog from "../components/ComposerDialog";
import ErrorNoEnvFilePopup from "@/components/ErrorNoEnvFilePopup";

let timer;

export default {
  name: "Dashboard",
  components: {
    ErrorNoEnvFilePopup,
    TransactionsDrawer,
    ComposerDialog,
    TransferDialog,
    MintBurnDialog,
    TokenDetailsDialog,
    TokenCreateDialog,
    Tokens,
    Accounts,
    Wallet
  },
  computed: {
    currentTokenId() {
      return this.$store.getters.currentTokenId;
    }
  },
  data: function() {
    return {
      message: "",
      footerColor: "primary",
      textColor: "white--text",
      busy: false,
      showUI: "Issuer",
      walletKey: 0
    };
  },
  created() {
    EventBus.$on("busy", busy => {
      this.busy = busy;
    });
    EventBus.$on("viewChange", ui => {
      this.showUI = ui;
      this.walletKey += 1;
    });

    EventBus.$on("notify", notification => {
      this.message = notification.message;
      if (notification.status) {
        this.footerColor = "green darken-2 text-center";
        this.textColor = "white--text";
      } else {
        this.footerColor = "orange darken-2 text-center";
        this.textColor = "black--text";
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.message = "";
        this.footerColor = "primary";
      }, 5000);
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
</style>
