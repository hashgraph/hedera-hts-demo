import { hederaClient } from "./client";
const {
  Ed25519PrivateKey,
  AccountCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

export async function createAccount(wallet) {
  let client = hederaClient();

  const privateKey = await Ed25519PrivateKey.generate();

  const transactionId = await new AccountCreateTransaction()
    .setKey(privateKey.publicKey)
    .setMaxTransactionFee(new Hbar(1))
    .setInitialBalance(process.env.VUE_APP_INITIAL_BALANCE)
    .execute(client);

  const transactionReceipt = await transactionId.getReceipt(client);
  const newAccountId = transactionReceipt.getAccountId();

  return {
    accountId: newAccountId.toString(),
    account: {
      wallet: wallet,
      privateKey: privateKey.toString(),
      tokenRelationships: {}
    }
  };
}
