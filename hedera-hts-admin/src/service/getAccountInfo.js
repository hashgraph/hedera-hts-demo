import { hederaClient } from "./client";
import { notifyError } from "../utils";
const { AccountInfoQuery } = require("@hashgraph/sdk");

export async function getAccountInfo(accountId) {
  let client = hederaClient();
  try {
    // cycle token relationships
    let tokenRelationships = {};

    // const info = await new AccountInfoQuery()
    await new AccountInfoQuery().setAccountId(accountId).execute(client);

    const storedTokens = JSON.parse(localStorage.getItem("tokens") || "{}");
    if (Object.keys(storedTokens).length != 0) {
      const token0 = storedTokens[Object.keys(storedTokens)[0]];
      const tokenRelationship = {
        tokenId: "0.0.1010",
        balance: "20",
        freezeStatus: token0.defaultFreezeStatus,
      };
      if (token0.kycKey) {
        tokenRelationship.kycStatus = 2;
      } else {
        tokenRelationship.kycStatus = 0;
      }

      tokenRelationships[token0.tokenId] = tokenRelationship;
      console.log("setting relationships for " + accountId);
    }

    return tokenRelationships;
  } catch (err) {
    notifyError("getAccountInfo " + err.message);
  }
}
