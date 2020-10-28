<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-col cols="4" v-for="token in tokens" :key="token.tokenId">
          <TokenCard v-bind:tokenId="token.tokenId"></TokenCard>
        </v-col>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import TokenCard from "../components/TokenCard";

export default {
  name: "Tokens",
  components: {
    TokenCard
  },
  data: function() {
    return {
      counter: 0
    };
  },
  computed: {
    tokens() {
      if (typeof this.$store.getters.getTokens === "undefined") {
        return {};
      } else {
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
