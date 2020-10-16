<template>
  <div>
    <v-container>
      <TokenCreate />
      <div v-if="accountRelations.length != 0">Accounts associated with token {{ token.symbol }}</div>
      <div v-else>No Accounts associated with token {{ token.symbol }}</div>
      <v-btn color="blue darken-1"
             @click="returnToTokens"
             text>
        return to tokens
      </v-btn>
      <v-layout row wrap>
        <v-col cols="4" v-for="accountRelation in accountRelations" :key="accountRelation.accountId">
          <AccountCard v-bind:accountRelation="accountRelation"></AccountCard>
        </v-col>
      </v-layout>
      <small v-if="accountRelations.length != 0">
        * An amount to wipe can be set through the API, this demo wipes the entire balance.
      </small>
    </v-container>
  </div>
</template>

<script>
import AccountCard from "../components/AccountCard";
import TokenCreate from "../components/TokenCreate";

export default {
  name: "Accounts",
  components: {
    AccountCard,
    TokenCreate
  },
  data: function() {
    return {
      counter: 0,
      tokenId: this.$store.getters.currentTokenId,
      accounts: this.$store.getters.getAccounts,
      token: this.$store.getters.getTokens[this.$store.getters.currentTokenId]
    };
  },
  watch: {
    accounts() {
      console.log("watch accounts");
      return this.accounts = this.$store.getters.getAccounts;
    },
    tokenId() {
      console.log("watch tokenid");
      return this.tokenId = this.$store.getters.currentTokenId;
    },
    token() {
      console.log("watch token");
      return this.token = this.$store.getters.getTokens[this.tokenId];
    }
  },
  methods: {
    returnToTokens() {
      this.$store.commit("setCurrentTokenId", undefined);
    }
  },
  computed: {
    accountRelations() {
      console.log("recomputing accounts");
      const tokenAccounts = [];
      const _token = this.token;
      for (const key in this.accounts) {
        const account = this.accounts[key];
        if (typeof account.tokenRelationships !== "undefined") {
          const relation = account.tokenRelationships[_token.tokenId];
          if (typeof relation !== 'undefined') {
            const accountRelation = {
              accountId: account.accountId,
              token: _token
            };
            tokenAccounts.push(accountRelation);
          }
        }
      }
      return tokenAccounts;
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
