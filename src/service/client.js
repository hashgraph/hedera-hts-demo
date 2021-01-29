import { getAccountDetails } from "../utils";

const { Client, Hbar } = require("@hashgraph/sdk");

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
    throw new Error("VUE_APP_NETWORK must be set in environment");
  }

  let client;
  switch (process.env.VUE_APP_NETWORK.toUpperCase()) {
    case "TESTNET":
      client = Client.forTestnet();
      break;
    case "MAINNET":
      client = Client.forMainnet();
      break;
    default:
      throw new Error('VUE_APP_NETWORK must be "testnet" or "mainnet"');
  }
  client.setOperator(operatorAccount, operatorPrivateKey);
  if ((typeof(process.env.VUE_APP_MAX_TX_FEE) !== undefined) && (process.env.VUE_APP_MAX_TX_FEE !== "")) {
    client.setMaxTransactionFee(new Hbar(process.env.VUE_APP_MAX_TX_FEE));
  }
  if ((typeof(process.env.VUE_APP_MAX_QUERY_PAYMENT) !== undefined) && (process.env.VUE_APP_MAX_QUERY_PAYMENT !== "")) {
    client.setMaxQueryPayment(new Hbar(process.env.VUE_APP_MAX_QUERY_PAYMENT));
  }
  return client;
}
