import { hederaClient } from "./client";
import { notifyError } from "../utils";
const { AccountInfoQuery } = require("@hashgraph/sdk");

export async function getAccountInfo(accountId) {
  let client = hederaClient();
  try {
    // cycle token relationships
    let tokenRelationships = [];

    // const info = await new AccountInfoQuery()
    await new AccountInfoQuery().setAccountId(accountId).execute(client);

    const tokenRelationship = {
      balance: "0",
      freezeStatus: "",
      kycStatus: "",
      symbol: "TEST",
      tokenId: "0.0.101"
    };

    tokenRelationships.push(tokenRelationship);

    return tokenRelationships;
  } catch (err) {
    notifyError(err.message || "Network error");
  }
}
