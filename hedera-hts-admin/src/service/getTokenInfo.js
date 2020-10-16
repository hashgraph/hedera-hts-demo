import { hederaClient } from "./client";
import { notifyError } from "../utils";
import { AccountInfoQuery } from "@hashgraph/sdk";
const { TokenInfoQuery } = require("@hashgraph/sdk");

export async function getTokenInfo(token) {
  let client = hederaClient();
  const tokenResponse = token;
  try {
    // const info = await new AccountInfoQuery()
    // await new AccountInfoQuery().setAccountId(token.tokenId).execute(client);
    const info = await new TokenInfoQuery()
      .setTokenId(token.tokenId)
      .execute(client);

    tokenResponse.token.totalSupply = info.totalSupply;
  } catch (err) {
    notifyError(err.message);
  }

  return tokenResponse;
}
export async function getTokenInfoFake(token) {
  let client = hederaClient();
  const tokenResponse = token;
  try {
    await new AccountInfoQuery().setAccountId(token.tokenId).execute(client);
  } catch (err) {
    notifyError(err.message);
  }

  return tokenResponse;
}
