<template>
  <v-navigation-drawer v-model="drawer" absolute temporary right width="400px">
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>Successful Transactions</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense>
      <div v-for="transaction in transactions" :key="transaction.id" link>
        <v-list-item>
          <v-list-item-content align="left">
            <v-list-item-title
              ><strong>{{ transaction.type }}</strong></v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item align="left">
          <v-list-item-icon>
            <v-icon>mdi-export</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ transaction.inputs }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item align="left" v-if="transaction.outputs">
          <v-list-item-icon>
            <v-icon>mdi-import</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ transaction.outputs }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import { EventBus } from "@/eventBus";

export default {
  name: "TransactionsDrawer",
  data: function() {
    return {
      drawer: null,
      transactions: []
    };
  },
  created() {
    EventBus.$on("showTransactions", () => {
      this.drawer = !this.drawer;
    });
    EventBus.$on("addTransaction", transaction => {
      this.transactions.splice(0, 0, transaction);
    });
    EventBus.$on("nuke", () => {
      this.transactions = [];
    });
  }
};
</script>

<style scoped></style>
