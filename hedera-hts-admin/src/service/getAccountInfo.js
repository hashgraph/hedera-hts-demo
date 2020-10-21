import { hederaClient } from "./client";
import { notifyError } from "../utils";
const { AccountInfoQuery } = require("@hashgraph/sdk");
import state from "../store/store"

export async function getAccountInfo(accountId) {
  let client = hederaClient();
  try {
    // cycle token relationships
    let tokenRelationships = {};
    const info = await new AccountInfoQuery().setAccountId(accountId).execute(client);
    const hBarBalance = info.balance;
    const storedTokens = state.getters.getTokens;
    if (typeof storedTokens !== "undefined") {
      if (Object.keys(storedTokens).length != 0) {
        const token0 = storedTokens[Object.keys(storedTokens)[0]];
        const tokenRelationship = {
          tokenId: "0.0.1010",
          hbarBalance: hBarBalance.toString(),
        };

        // TODO: We should get this data from the network eventually
        const existingRelationships = state.getters.getAccounts[accountId].tokenRelationships;
        if (typeof existingRelationships !== "undefined") {
          const existingTokenRelationship = existingRelationships[token0.tokenId];
          if (typeof existingTokenRelationship !== "undefined") {
            tokenRelationship.freezeStatus = existingTokenRelationship.freezeStatus;
            tokenRelationship.kycStatus = existingTokenRelationship.kycStatus;
            tokenRelationship.balance = existingTokenRelationship.balance;
          } else {
            tokenRelationship.balance = 20012;
            tokenRelationship.freezeStatus = storedTokens[token0.tokenId].defaultFreezeStatus;
            if (token0.kycKey) {
              tokenRelationship.kycStatus = 2;
            } else {
              tokenRelationship.kycStatus = 0;
            }
          }
        } else {
          tokenRelationship.balance = 20012;
          tokenRelationship.freezeStatus = storedTokens[token0.tokenId].defaultFreezeStatus;
          if (token0.kycKey) {
            tokenRelationship.kycStatus = 2;
          } else {
            tokenRelationship.kycStatus = 0;
          }
        }

        tokenRelationships[token0.tokenId] = tokenRelationship;
      }
    }
    return  tokenRelationships;
  } catch (err) {
    notifyError("getAccountInfo " + err.message);
    return undefined;
  }
}
