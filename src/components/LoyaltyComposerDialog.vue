<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-toolbar>
        <v-tabs centered v-model="tabs">
          <v-tab>Loyalty Tokens</v-tab>
          <v-tab>Gift/Product Card</v-tab>
        </v-tabs>
      </v-toolbar>
      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <FungibleLoyaltyComposer></FungibleLoyaltyComposer>
        </v-tab-item>
        <v-tab-item>
          <NonFungibleLoyaltyComposer></NonFungibleLoyaltyComposer>
        </v-tab-item>
      </v-tabs-items>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "../eventBus";
import FungibleLoyaltyComposer from "@/components/FungibleLoyaltyComposer";
import NonFungibleLoyaltyComposer from "@/components/NonFungibleLoyaltyComposer";

export default {
  name: "LoyaltyComposer",
  components: { NonFungibleLoyaltyComposer, FungibleLoyaltyComposer },
  data: function() {
    return {
      fungible: "yes",
      dialog: false,
      tabs: null
    };
  },
  created() {
    EventBus.$on("tokenCreateLoyalty", () => {
      this.dialog = true;
    });
    EventBus.$on("dialogClose", () => {
      this.dialog = false;
    });
  },
  computed: {},
  methods: {}
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
