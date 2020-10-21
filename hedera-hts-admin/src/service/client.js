import {getAccountDetails} from "../utils";

const { Client } = require("@hashgraph/sdk");

export function hederaClientForUser(user) {
  let account = getAccountDetails(user);
  return hederaClientLocal(account.accountId, account.privateKey);
}

export function hederaClient() {

  const operatorPrivateKey = process.env.VUE_APP_OPERATOR_KEY;
  const operatorAccount = process.env.VUE_APP_OPERATOR_ID;
  if (
      typeof operatorPrivateKey === "undefined" ||
      typeof operatorAccount === "undefined"
  ) {
    throw new Error(
        "environment variables VUE_APP_OPERATOR_KEY and VUE_APP_OPERATOR_ID must be present"
    );
  }
  return hederaClientLocal(operatorAccount, operatorPrivateKey);
}

function hederaClientLocal(operatorAccount, operatorPrivateKey) {
  let client = Client.forTestnet();
  client.setOperator(operatorAccount, operatorPrivateKey);
  switch (process.env.VUE_APP_NETWORK) {
    case "testnet":
      client = Client.forTestnet();
      break;
    case "mainnet":
      client = Client.forMainnet();
      break;
    case "previewnet":
      client = Client.forPreviewnet();
      break;
    case "custom":
      if (typeof process.env.VUE_APP_NETWORK_NODES === "undefined") {
        throw new Error(
          "VUE_APP_NETWORK_NODES must be set in .env for custom network"
        );
      }

      client = Client.fromJson(
        process.env.VUE_APP_NETWORK_NODES.replaceAll("\\", "")
      );
      break;
    default:
      throw new Error(
        "environment variables VUE_APP_NETWORK must be one of testnet, mainne, previewnet or custom"
      );
  }
  client.setOperator(operatorAccount, operatorPrivateKey);

  return client;
}
