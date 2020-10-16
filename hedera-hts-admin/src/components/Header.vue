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

    <v-btn text @click="showCreate()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-btn text @click="nuke()">
      <v-icon>mdi-nuke</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { notifySuccess } from "../utils";
import { EventBus } from "../eventBus";
export default {
  name: "Header",
  // computed: {
  //   tokenId() {
  //     return this.$store.getters.currentToken;
  //   }
  // },
  methods: {
    showCreate() {
      EventBus.$emit("tokenCreate", "");
    },
    nuke() {
      EventBus.$emit("busy",true);
      localStorage.setItem("accounts", []);
      localStorage.setItem("tokens", []);
      notifySuccess("Clearing demo. Please wait");
      this.$store.commit("reset");
      this.$store.dispatch("setup");
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
