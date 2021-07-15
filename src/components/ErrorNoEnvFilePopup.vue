<!-- Popup is shown if testnet credentials are not set in the env variables -->
<template>
  <v-row justify="center">
    <v-dialog persistent v-model="popup" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Missing testnet account details</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <p>
                  Hedera Testnet account details not found. Please
                  <a href="https://portal.hedera.com/" target="_blank"
                    >register</a
                  >
                  for a Hedera Testnet account and populate
                  <code>.env</code> file in the project source with your Testnet
                  credentials. <br />Once done, restart the server by running
                  <br /><code
                    >yarn run serve --host 0.0.0.0 --disable-host-check</code
                  ><br />
                  in Terminal to restart the server.
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
  name: "ErrorNoEnvFilePopup",
  data: function() {
    return {
      popup: false
    };
  },
  created() {
    if (
      !process.env.VUE_APP_OPERATOR_KEY ||
      !process.env.VUE_APP_OPERATOR_ID ||
      process.env.VUE_APP_OPERATOR_ID === "0.0.xxxx" ||
      process.env.VUE_APP_OPERATOR_KEY === "302xxx"
    ) {
      this.popup = true;
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
