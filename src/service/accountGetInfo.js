import { hederaClient } from "./client";
import { notifyError } from "../utils";
const { AccountInfoQuery } = require("@hashgraph/sdk");
// import state from "../store/store"

export async function accountGetInfo(accountId) {
  const client = hederaClient();
  try {
    // cycle token relationships
    let tokenRelationships = {};
    const info = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client);
    const hBarBalance = info.balance;

    for (let key of info.tokenRelationships.keys()) {
      const tokenRelationship = {
        tokenId: key.toString(),
        hbarBalance: hBarBalance.toString(),
        balance: info.tokenRelationships.get(key).balance.toString(),
        freezeStatus: info.tokenRelationships.get(key).freezeStatus,
        kycStatus: info.tokenRelationships.get(key).kycStatus
      };
      tokenRelationships[key] = tokenRelationship;
    }

    return tokenRelationships;
  } catch (err) {
    notifyError("getAccountInfo " + err.message);
    return undefined;
  }
}
