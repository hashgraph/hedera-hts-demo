import { hederaClient } from "./client";
import { notifyError, notifySuccess } from "../utils";

const {
  Ed25519PrivateKey,
  TokenCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

const operatorAccount = process.env.VUE_APP_OPERATOR_ID;

export async function createToken(token) {
  let client = hederaClient();
  let tokenResponse = {};

  // const privateKey = await Ed25519PrivateKey.generate();
  try {
    const tx = new TokenCreateTransaction()
      .setName(token.name)
      .setSymbol(token.symbol.toUpperCase())
      .setDecimals(token.decimals)
      .setInitialSupply(token.initialSupply)
      .setTreasury(token.treasury)
      .setFreezeDefault(token.defaultFreezeStatus)
      .setAutorenewaccount(token.autoRenewAccount)
      .setMaxTransactionFee(new Hbar(1));

    if (token.adminKey) {
      tx.setAdminKey(Ed25519PrivateKey.fromString(token.adminKey).publicKey);
    }
    if (token.kycKey) {
      tx.setKycKey(Ed25519PrivateKey.fromString(token.kycKey).publicKey);
    }
    if (token.freezeKey) {
      tx.setFreezeKey(Ed25519PrivateKey.fromString(token.freezeKey).publicKey);
    }
    if (token.wipeKey) {
      tx.setWipeKey(Ed25519PrivateKey.fromString(token.wipeKey).publicKey);
    }

    const transactionId = tx.execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    if (transactionReceipt.status._isError()) {
      notifyError(transactionReceipt.status.message);
    } else {
      const newTokenId = transactionReceipt.getAccountId();

      tokenResponse = {
        tokenId: newTokenId.toString(),
        token: {
          tokenId: newTokenId.toString(),
          symbol: token.symbol,
          name: token.name,
          totalSupply: token.initialSupply,
          decimals: token.decimals,
          autoRenewAccount: operatorAccount,
          autoRenewPeriod: "110",
          defaultFreezeStatus: token.defaultFreezeStatus,
          defaultKycStatus: token.defaultKYC,
          kycKey: token.kycKey,
          wipeKey: token.wipeKey,
          freezeKey: token.freezeKey,
          adminKey: token.adminKey,
          expiry: "0",
          isDeleted: false,
          treasury: operatorAccount
        }
      };

      notifySuccess("token created successfully");
    }
  } catch (err) {
    console.error(err);
    notifyError(err.message);
  }
  return tokenResponse;
}
