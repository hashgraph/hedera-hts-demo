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

    const storedTokens = JSON.parse(localStorage.getItem("tokens") || "[]");
    if (storedTokens.length != 0) {
      const tokenRelationship = {
        tokenId: "0.0.1010",
        balance: "20",
        freezeStatus: storedTokens[0].token.defaultFreezeStatus,
      };
      if (storedTokens[0].token.kycKey) {
        tokenRelationship.kycStatus = 2;
      } else {
        tokenRelationship.kycStatus = 0;
      }

      tokenRelationship.tokenId = storedTokens[0].tokenId;
      console.log("setting relationships for " + accountId);
      tokenRelationships.push(tokenRelationship);
    }

    return tokenRelationships;
  } catch (err) {
    notifyError(err.message || "Network error");
  }
}
