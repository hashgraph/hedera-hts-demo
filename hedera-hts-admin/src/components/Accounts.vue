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
      <div> {{ accounts }}</div>
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
      token: this.$store.getters.currentToken,
      accounts: this.$store.getters.getAccounts
    };
  },
  methods: {
    returnToTokens() {
      this.$store.commit("currentToken", undefined);
    }
  },
  computed: {
    accountRelations: function () {
      console.log("recomputing accounts");
      const tokenAccounts = [];
      const localToken = this.token;
      this.accounts.forEach(function (account) {
        if (typeof account.account.tokenRelationships !== "undefined") {
          account.account.tokenRelationships.forEach(function (relation) {
            if (relation.tokenId === localToken.tokenId) {
              console.dir(account);
              console.dir(account.account);
              console.dir(account.account.owner);
              const accountRelation = {
                accountId: account.accountId,
                balance: relation.balance,
                freezeStatus: relation.freezeStatus,
                kycStatus: relation.kycStatus,
                owner: account.account.owner,
                wipeKey: localToken.wipeKey
              };
              tokenAccounts.push(accountRelation);
            }
          });
        }
      });
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
