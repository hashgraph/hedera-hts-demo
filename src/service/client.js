import { getAccountDetails } from "../utils";

const { Client } = require("@hashgraph/sdk");

export function hederaClientForUser(user) {
  const account = getAccountDetails(user);
  return hederaClientLocal(account.accountId, account.privateKey);
}

function checkProvided(environmentVariable) {
  if (environmentVariable === null) {
    return false;
  }
  if (typeof environmentVariable === "undefined") {
    return false;
  }
  return true;
}

export function hederaClient() {
  const operatorPrivateKey = process.env.VUE_APP_OPERATOR_KEY;
  const operatorAccount = process.env.VUE_APP_OPERATOR_ID;

  if (!checkProvided(operatorPrivateKey) || !checkProvided(operatorAccount)) {
    throw new Error(
      "environment variables VUE_APP_OPERATOR_KEY and VUE_APP_OPERATOR_ID must be present"
    );
  }
  return hederaClientLocal(operatorAccount, operatorPrivateKey);
}

function hederaClientLocal(operatorAccount, operatorPrivateKey) {
  if (!checkProvided(process.env.VUE_APP_NETWORK)) {
    throw new Error("VUE_APP_NETWORK_NODES must be set in .env");
  }
  const network = {};
  network.network = {};
  network.network[process.env.VUE_APP_NETWORK] = {
    shard: 0,
    realm: 0,
    account: 3
  };
  const client = new Client(network);
  client.setOperator(operatorAccount, operatorPrivateKey);
  return client;
}
