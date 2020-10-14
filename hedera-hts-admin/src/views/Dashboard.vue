<template>
  <div>
    <div v-if="currentToken">
      <Accounts />
    </div>
    <div v-else>
      <Tokens />
    </div>
    {{ currentToken }}
    <v-footer :color="footerColor" absolute class="font-weight-medium" padless>
      <v-card flat tile width="100%" :class="footerColor">
        <v-card-text :class="textColor"
          ><strong>{{ message }}</strong></v-card-text
        >
      </v-card>
    </v-footer>
  </div>
</template>

<script>
import Tokens from "../components/Tokens";
import Accounts from "../components/Accounts";

import { EventBus } from "../eventBus";

let timer;

export default {
  name: "Dashboard",
  components: {
    Tokens,
    Accounts
  },
  computed: {
    currentToken() {
      return this.$store.getters.currentToken;
    }
  },
  data: () => ({
    message: "",
    footerColor: "primary",
    textColor: "white--text"
  }),
  created() {
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
