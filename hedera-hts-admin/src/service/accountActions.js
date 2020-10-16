import { hederaClient } from "./client";
import {notifyError, notifySuccess } from "../utils";
const {
  Ed25519PrivateKey,
  AccountCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

let client = hederaClient();

export async function freezeAccount(freezeInstruction) {
  //TODO: Implement freeze properly
  const privateKey = await Ed25519PrivateKey.generate();
  try {
    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(Hbar.fromTinybar(10))
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    if (transactionReceipt.status._isError()) {
      notifyError(transactionReceipt.status.message);
      return false;
    }

    if (freezeInstruction.freeze) {
      notifySuccess("Account " + freezeInstruction.accountId + " activity on token " + freezeInstruction.tokenId + " frozen");
    } else {
      notifySuccess("Account " + freezeInstruction.accountId + " activity on token " + freezeInstruction.tokenId + " unfrozen");
    }
  } catch (err) {
    console.error(err);
    notifyError(err.message);
    return false;
  }
  return true;
}
export async function kycAccount(kycInstruction) {
  //TODO: Implement kyc properly
  const privateKey = await Ed25519PrivateKey.generate();
  try {
    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(Hbar.fromTinybar(10))
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    if (transactionReceipt.status._isError()) {
      notifyError(transactionReceipt.status.message);
      return false;
    }

    if (kycInstruction.kyc) {
      notifySuccess("KYC granted for account " + kycInstruction.accountId + " and token " + kycInstruction.tokenId);
    } else {
      notifySuccess("KYC revoked for account " + kycInstruction.accountId + " and token " + kycInstruction.tokenId);
    }
  } catch (err) {
    console.error(err);
    notifyError(err.message);
    return false;
  }
  return true;
}
export async function wipeAccount(wipeInstruction) {
  //TODO: Implement wipe properly
  const privateKey = await Ed25519PrivateKey.generate();
  try {
    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setMaxTransactionFee(new Hbar(1))
        .setInitialBalance(Hbar.fromTinybar(10))
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);
    if (transactionReceipt.status._isError()) {
      notifyError(transactionReceipt.status.message);
      return false;
    }

    notifySuccess("Account " + wipeInstruction.accountId + " and token " + wipeInstruction.tokenId + " balance wiped");
  } catch (err) {
    console.error(err);
    notifyError(err.message);
    return false;
  }
  return true;
}
