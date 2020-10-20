<template>
  <div>
    <v-container>
      <div v-if="accountId">wallet {{ accountId }}</div>
      <div v-else>Wallet account isn't setup</div>
    </v-container>
  </div>
</template>

<script>

export default {
  name: "Wallet",
  props: [ 'walletInstance' ],
  data: function() {
    return {
    };
  },
  computed: {
    accountId() {
      let account = "";
      if (this.$store.getters.numberOfAccounts !== 0) {
        for (const key in this.$store.getters.getAccounts) {
          if (this.$store.getters.getAccounts[key].account.wallet === this.walletInstance) {
            account = key;
            break;
          }
        }
      }
      return account;
    }
  },
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
