import { hederaClient } from "./client";
import { notifyError, notifySuccess } from "../utils";
import { AccountCreateTransaction } from "@hashgraph/sdk";

const {
  Ed25519PrivateKey,
  TokenCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

const operatorAccount = process.env.VUE_APP_OPERATOR_ID;
let client = hederaClient();
let tokenResponse = {};

export async function createToken(token) {
  try {
    const tx = new TokenCreateTransaction()
      .setName(token.name)
      .setSymbol(token.symbol.toUpperCase())
      .setDecimals(token.decimals)
      .setInitialSupply(token.initialSupply)
      .setTreasury(token.treasury)
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
      if (token.defaultFreezeStatus) tx.setFreezeDefault(1);
      else {
        tx.setFreezeDefault(2);
      }
    } else {
      tx.setFreezeDefault(0);
    }
    if (token.wipeKey) {
      tx.setWipeKey(Ed25519PrivateKey.fromString(token.wipeKey).publicKey);
    }
    if (token.supplyKey) {
      tx.setSupplyKey(Ed25519PrivateKey.fromString(token.supplyKey).publicKey);
    }

    const transactionId = tx.execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    if (transactionReceipt.status._isError()) {
      notifyError(transactionReceipt.status.message);
    } else {
      const newTokenId = transactionReceipt.getAccountId();
      //TODO: default freeze and kyc status is one of three values
      tokenResponse = {
        tokenId: newTokenId.toString(),
        symbol: token.symbol,
        name: token.name,
        totalSupply: token.initialSupply,
        decimals: token.decimals,
        autoRenewAccount: operatorAccount,
        autoRenewPeriod: "110",
        defaultFreezeStatus: token.defaultFreezeStatus,
        defaultKYCStatus: token.defaultKYCStatus,
        kycKey: token.kycKey,
        wipeKey: token.wipeKey,
        freezeKey: token.freezeKey,
        adminKey: token.adminKey,
        supplyKey: token.supplyKey,
        expiry: "0",
        isDeleted: false,
        treasury: operatorAccount
      };

      notifySuccess("token created successfully");
    }
  } catch (err) {
    console.error(err);
    notifyError(err.message);
  }
  return tokenResponse;
}

export async function createTokenFake(token) {
  try {
    const privateKey = await Ed25519PrivateKey.generate();

    const transactionId = await new AccountCreateTransaction()
      .setKey(privateKey.publicKey)
      .setMaxTransactionFee(new Hbar(1))
      .setInitialBalance(Hbar.fromTinybar(10))
      .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const newTokenId = transactionReceipt.getAccountId();

    console.log(
      "create token fake default freeze: " + token.defaultFreezeStatus
    );
    tokenResponse = {
      tokenId: newTokenId.toString(),
      symbol: token.symbol,
      name: token.name,
      totalSupply: token.initialSupply,
      decimals: token.decimals,
      autoRenewAccount: operatorAccount,
      autoRenewPeriod: "110",
      defaultFreezeStatus: token.defaultFreezeStatus,
      kycKey: token.kycKey,
      wipeKey: token.wipeKey,
      freezeKey: token.freezeKey,
      adminKey: token.adminKey,
      supplyKey: token.supplyKey,
      expiry: "0",
      isDeleted: false,
      treasury: operatorAccount
    };

    notifySuccess("token created successfully");
    return tokenResponse;
  } catch (err) {
    console.error(err);
    notifyError(err.message);
    return {};
  }
}
