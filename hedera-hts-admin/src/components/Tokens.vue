<template>
  <div>
    <v-container>
      <TokenCreate />
      <v-layout row wrap>
        <v-col cols="4" v-for="token in tokens" :key="token.tokenId">
          <TokenCard v-bind:token="token.token"></TokenCard>
        </v-col>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TokenCard from "../components/TokenCard";
import TokenCreate from "../components/TokenCreate";

export default {
  name: "Tokens",
  components: {
    TokenCard,
    TokenCreate
  },
  data: function() {
    return {
      counter: 0,
    };
  },
  computed: {
    tokens() {
      console.log(this.$store);
      if (typeof this.$store.getters.getTokens === "undefined") {
        console.log("no tokens");
        return [];
      } else {
        console.log("token count = " + this.$store.getters.getTokens.length);
        return this.$store.getters.getTokens;
      }
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
