import { hederaClient } from "./client";
import { notifyError } from "../utils";
const { TokenInfoQuery } = require("@hashgraph/sdk");

// const { AccountInfoQuery } = require("@hashgraph/sdk");

export async function getTokenInfo(token) {
  let client = hederaClient();
  const tokenResponse = token.token;
  try {
    // const info = await new AccountInfoQuery()
    // await new AccountInfoQuery().setAccountId(token.tokenId).execute(client);
    const info = await new TokenInfoQuery()
      .setTokenId(token.tokenId)
      .execute(client);

    tokenResponse.totalSupply = info.totalSupply;
  } catch (err) {
    notifyError(err.message);
  }

  return tokenResponse;
}
