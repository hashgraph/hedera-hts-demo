import { hederaClient } from "./client";
import { EventBus } from "@/eventBus";
import {notifyError} from "@/utils";

const {
  PrivateKey,
  AccountCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

export async function accountCreate(wallet) {
  const client = hederaClient();

  try {

    const privateKey = await PrivateKey.generate();

    const response = await new AccountCreateTransaction()
      .setKey(privateKey.publicKey)
      .setInitialBalance(new Hbar(process.env.VUE_APP_INITIAL_BALANCE))
      .execute(client);

    const transactionReceipt = await response.getReceipt(client);
    const newAccountId = transactionReceipt.accountId;

    const transaction = {
      id: response.transactionId.toString(),
      type: "cryptoCreate",
      inputs: "initialBalance=" + process.env.VUE_APP_INITIAL_BALANCE,
      outputs: "accountId=" + newAccountId.toString()
    };
    EventBus.$emit("addTransaction", transaction);

    return {
      accountId: newAccountId.toString(),
      account: {
        wallet: wallet,
        privateKey: privateKey.toString(),
        tokenRelationships: {}
      }
    };
  } catch (err) {
    notifyError(err.message);
    console.error(err);
    return {};
  }
}
