import { hederaClientForUser} from "./client";
import { notifyError, notifySuccess} from "../utils";
import { AccountCreateTransaction } from "@hashgraph/sdk";

const {
  Ed25519PrivateKey,
  TokenCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

const operatorAccount = process.env.VUE_APP_OPERATOR_ID;
let tokenResponse = {};
const autoRenewPeriod = 7776000;  // set to default 3 months

export async function createToken(token) {
  // get private key and account for owner from accounts
  let client = hederaClientForUser("owner");
  try {
    const tx = new TokenCreateTransaction();
    tx.setName(token.name);
    tx.setSymbol(token.symbol.toUpperCase());
    tx.setDecimals(token.decimals);
    tx.setInitialSupply(token.initialSupply);
    tx.setTreasury(token.treasury);
    tx.setAutoRenewAccount(token.autoRenewAccount);
    tx.setMaxTransactionFee(new Hbar(1));
    tx.setAutoRenewPeriod(autoRenewPeriod);

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
      const newTokenId = transactionReceipt.getTokenId();
      //TODO: default freeze and kyc status is one of three values
      tokenResponse = {
        tokenId: newTokenId.toString(),
        symbol: token.symbol,
        name: token.name,
        totalSupply: token.initialSupply,
        decimals: token.decimals,
        autoRenewAccount: operatorAccount,
        autoRenewPeriod: autoRenewPeriod,
        defaultFreezeStatus: token.defaultFreezeStatus,
        kycKey: token.kycKey,
        wipeKey: token.wipeKey,
        freezeKey: token.freezeKey,
        adminKey: token.adminKey,
        supplyKey: token.supplyKey,
        expiry: "",
        isDeleted: false,
        treasury: operatorAccount
      };

      notifySuccess("token created successfully");
    }
    return tokenResponse;

  } catch (err) {
    console.error(err);
    notifyError(err.message);
    return {};
  }
}

export async function createTokenFake(token) {
  let client = hederaClientForUser("owner");
  try {
    const privateKey = await Ed25519PrivateKey.generate();

    const transactionId = await new AccountCreateTransaction()
      .setKey(privateKey.publicKey)
      .setMaxTransactionFee(new Hbar(1))
      .setInitialBalance(Hbar.fromTinybar(10))
      .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    const newTokenId = transactionReceipt.getAccountId();

    let expiryTime = (new Date().getTime() + (autoRenewPeriod * 1000)) / 1000;
    tokenResponse = {
      tokenId: newTokenId.toString(),
      symbol: token.symbol,
      name: token.name,
      totalSupply: token.initialSupply,
      decimals: token.decimals,
      autoRenewAccount: operatorAccount,
      autoRenewPeriod: autoRenewPeriod,
      defaultFreezeStatus: token.defaultFreezeStatus,
      kycKey: token.kycKey,
      wipeKey: token.wipeKey,
      freezeKey: token.freezeKey,
      adminKey: token.adminKey,
      supplyKey: token.supplyKey,
      expiry: expiryTime,
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
