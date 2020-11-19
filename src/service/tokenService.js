import { hederaClient, hederaClientForUser } from "./client";
import { getAccountDetails, notifyError, notifySuccess } from "../utils";
import state from "../store/store";
import { EventBus } from "@/eventBus";
import store from "@/store/store";

const {
  PrivateKey,
  TokenCreateTransaction,
  TokenAssociateTransaction,
  TokenBurnTransaction,
  TokenDeleteTransaction,
  TokenDissociateTransaction,
  TokenFreezeTransaction,
  TokenGrantKycTransaction,
  TokenInfoQuery,
  TokenMintTransaction,
  TokenRevokeKycTransaction,
  TransferTransaction,
  TokenUnfreezeTransaction,
  TokenWipeTransaction,
  Hbar,
  Status
} = require("@hashgraph/sdk");

function ownerClient() {
  return hederaClientForUser("owner");
}

export async function tokenGetInfo(token) {
  const client = hederaClient();
  const tokenResponse = token;
  try {
    const info = await new TokenInfoQuery()
      .setTokenId(token.tokenId)
      .execute(client);

    tokenResponse.totalSupply = info.totalSupply;
    tokenResponse.expiry = info.expirationTime.toDate();
  } catch (err) {
    notifyError(err.message);
  }

  return tokenResponse;
}

export async function tokenCreate(token) {
  let tokenResponse = {};
  const autoRenewPeriod = 7776000; // set to default 3 months
  const ownerAccount = getAccountDetails("owner").accountId.toString();
  try {
    let additionalSig = false;
    let sigKey;
    const tx = await new TokenCreateTransaction();
    tx.setTokenName(token.name);
    tx.setTokenSymbol(token.symbol.toUpperCase());
    tx.setDecimals(token.decimals);
    tx.setInitialSupply(token.initialSupply);
    tx.setTreasuryAccountId(token.treasury);
    tx.setAutoRenewAccountId(token.autoRenewAccount);
    tx.setMaxTransactionFee(new Hbar(1));
    tx.setAutoRenewPeriod(autoRenewPeriod);

    if (token.adminKey) {
      sigKey = PrivateKey.fromString(token.adminKey);
      tx.setAdminKey(sigKey.publicKey);
      additionalSig = true;
    }
    if (token.kycKey) {
      sigKey = PrivateKey.fromString(token.adminKey);
      tx.setKycKey(sigKey.publicKey);
      additionalSig = true;
    }
    if (token.freezeKey) {
      sigKey = PrivateKey.fromString(token.adminKey);
      tx.setFreezeKey(sigKey.publicKey);
      additionalSig = true;
      tx.setFreezeDefault(token.defaultFreezeStatus);
    } else {
      tx.setFreezeDefault(false);
    }
    if (token.wipeKey) {
      additionalSig = true;
      sigKey = PrivateKey.fromString(token.adminKey);
      tx.setWipeKey(sigKey.publicKey);
    }
    if (token.supplyKey) {
      additionalSig = true;
      sigKey = PrivateKey.fromString(token.adminKey);
      tx.setSupplyKey(sigKey.publicKey);
    }
    const client = ownerClient();

    await tx.signWithOperator(client);

    if (additionalSig) {
      // TODO: should sign with every key (check docs)
      // since the admin/kyc/... keys are all the same, a single sig is sufficient
      await tx.sign(sigKey);
    }

    const response = await tx.execute(client);

    const transactionReceipt = await response.getReceipt(client);

    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
    } else {
      token.tokenId = transactionReceipt.tokenId;

      const transaction = {
        id: response.transactionId.toString(),
        type: "tokenCreate",
        inputs:
          "Name=" +
          token.name +
          ", Symbol=" +
          token.symbol.toUpperCase() +
          ", Decimals=" +
          token.decimals +
          ", Supply=" +
          token.initialSupply +
          ", ...",
        outputs: "tokenId=" + token.tokenId.toString()
      };
      EventBus.$emit("addTransaction", transaction);

      const tokenInfo = await tokenGetInfo(token);

      tokenResponse = {
        tokenId: token.tokenId.toString(),
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        totalSupply: token.initialSupply,
        decimals: token.decimals,
        autoRenewAccount: ownerAccount,
        autoRenewPeriod: autoRenewPeriod,
        defaultFreezeStatus: token.defaultFreezeStatus,
        kycKey: token.kycKey,
        wipeKey: token.wipeKey,
        freezeKey: token.freezeKey,
        adminKey: token.adminKey,
        supplyKey: token.supplyKey,
        expiry: tokenInfo.expiry,
        isDeleted: false,
        treasury: ownerAccount
      };

      // force refresh
      await store.dispatch("fetch");
      notifySuccess("token created successfully");
    }
    return tokenResponse;
  } catch (err) {
    notifyError(err.message);
    return {};
  }
}

async function tokenTransactionWithAmount(
  client,
  transaction,
  instruction,
  key
) {
  try {
    transaction.setTokenId(instruction.tokenId);
    if (typeof instruction.accountId !== "undefined") {
      transaction.setAccountId(instruction.accountId);
    }
    transaction.setAmount(instruction.amount);
    transaction.setMaxTransactionFee(new Hbar(1));

    await transaction.signWithOperator(client);
    await transaction.sign(key);

    const response = await transaction.execute(client);

    const transactionReceipt = await response.getReceipt(client);
    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return {
        status: false
      };
    }
    // force refresh
    await store.dispatch("fetch");
    notifySuccess(instruction.successMessage);
    return {
      status: true,
      transactionId: response.transactionId.toString()
    };
  } catch (err) {
    notifyError(err.message);
    return {
      status: false
    };
  }
}

async function tokenTransactionWithIdAndAccount(
  client,
  transaction,
  instruction,
  key
) {
  try {
    transaction.setTokenId(instruction.tokenId);
    transaction.setAccountId(instruction.accountId);
    transaction.setMaxTransactionFee(new Hbar(1));

    await transaction.signWithOperator(client);
    await transaction.sign(key);

    const response = await transaction.execute(client);

    const transactionReceipt = await response.getReceipt(client);
    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return {
        status: false
      };
    }

    // force refresh
    await store.dispatch("fetch");
    notifySuccess(instruction.successMessage);
    return {
      status: true,
      transactionId: response.transactionId.toString()
    };
  } catch (err) {
    notifyError(err.message);
    return {
      status: false
    };
  }
}

export async function tokenBurn(instruction) {
  instruction.successMessage =
    "Burnt " + instruction.amount + " from token " + instruction.tokenId;
  const token = state.getters.getTokens[instruction.tokenId];
  const supplyKey = PrivateKey.fromString(token.supplyKey);
  const tx = await new TokenBurnTransaction();
  const client = ownerClient();
  const result = await tokenTransactionWithAmount(
    client,
    tx,
    instruction,
    supplyKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenBurn",
      inputs:
        "tokenId=" + instruction.tokenId + ", Amount=" + instruction.amount
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenMint(instruction) {
  instruction.successMessage =
    "Minted " + instruction.amount + " for token " + instruction.tokenId;
  const token = state.getters.getTokens[instruction.tokenId];
  const supplyKey = PrivateKey.fromString(token.supplyKey);
  const tx = await new TokenMintTransaction();
  const client = ownerClient();
  const result = await tokenTransactionWithAmount(
    client,
    tx,
    instruction,
    supplyKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenMint",
      inputs:
        "tokenId=" + instruction.tokenId + ", Amount=" + instruction.amount
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenWipe(instruction) {
  instruction.successMessage =
    "Wiped " + instruction.amount + " from account " + instruction.accountId;
  const token = state.getters.getTokens[instruction.tokenId];
  const supplyKey = PrivateKey.fromString(token.wipeKey);
  const tx = await new TokenWipeTransaction();
  const client = ownerClient();
  const result = await tokenTransactionWithAmount(
    client,
    tx,
    instruction,
    supplyKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenWipe",
      inputs:
        "tokenId=" +
        instruction.tokenId +
        ", AccountId=" +
        instruction.accountId +
        ", Amount=" +
        instruction.amount
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenFreeze(instruction) {
  const token = state.getters.getTokens[instruction.tokenId];
  const freezeKey = PrivateKey.fromString(token.freezeKey);
  const tx = await new TokenFreezeTransaction();
  instruction.successMessage = "Account " + instruction.accountId + " frozen";
  const client = ownerClient();
  const result = await tokenTransactionWithIdAndAccount(
    client,
    tx,
    instruction,
    freezeKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenFreeze",
      inputs:
        "tokenId=" +
        instruction.tokenId +
        ", AccountId=" +
        instruction.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenUnFreeze(instruction) {
  const token = state.getters.getTokens[instruction.tokenId];
  const freezeKey = PrivateKey.fromString(token.freezeKey);
  const tx = await new TokenUnfreezeTransaction();
  instruction.successMessage =
    "Account " + instruction.accountId + " defrosted";
  const client = ownerClient();
  const result = await tokenTransactionWithIdAndAccount(
    client,
    tx,
    instruction,
    freezeKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenUnFreeze",
      inputs:
        "tokenId=" +
        instruction.tokenId +
        ", AccountId=" +
        instruction.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenGrantKYC(instruction) {
  const token = state.getters.getTokens[instruction.tokenId];
  const kycKey = PrivateKey.fromString(token.kycKey);
  const tx = await new TokenGrantKycTransaction();
  instruction.successMessage =
    "Account " + instruction.accountId + " KYC Granted";
  const client = ownerClient();
  const result = await tokenTransactionWithIdAndAccount(
    client,
    tx,
    instruction,
    kycKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenGrantKYC",
      inputs:
        "tokenId=" +
        instruction.tokenId +
        ", AccountId=" +
        instruction.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenRevokeKYC(instruction) {
  const token = state.getters.getTokens[instruction.tokenId];
  const kycKey = PrivateKey.fromString(token.kycKey);
  const tx = await new TokenRevokeKycTransaction();
  instruction.successMessage =
    "Account " + instruction.accountId + " KYC Revoked";
  const client = ownerClient();
  const result = await tokenTransactionWithIdAndAccount(
    client,
    tx,
    instruction,
    kycKey
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenRevokeKYC",
      inputs:
        "tokenId=" +
        instruction.tokenId +
        ", AccountId=" +
        instruction.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

async function tokenAssociationTransaction(
  transaction,
  tokenId,
  account,
  user,
  message
) {
  const client = hederaClientForUser(user);

  const userKey = PrivateKey.fromString(account.privateKey);

  try {
    transaction.setTokenIds([tokenId]);
    transaction.setAccountId(account.accountId);
    transaction.setMaxTransactionFee(new Hbar(1));

    await transaction.signWithOperator(client);
    await transaction.sign(userKey);

    const response = await transaction.execute(client);

    const transactionReceipt = await response.getReceipt(client);
    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return {
        status: false
      };
    }

    // force refresh
    await store.dispatch("fetch");
    notifySuccess(message);
    return {
      status: true,
      transactionId: response.transactionId.toString()
    };
  } catch (err) {
    notifyError(err.message);
    return {
      status: false
    };
  }
}

export async function tokenAssociate(tokenId, user) {
  const account = getAccountDetails(user);
  const tx = await new TokenAssociateTransaction();
  const result = await tokenAssociationTransaction(
    tx,
    tokenId,
    account,
    user,
    "token successfully associated"
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenAssociate",
      inputs: "tokenId=" + tokenId + ", AccountId=" + account.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenDissociate(tokenId, user) {
  const account = getAccountDetails(user);
  const tx = await new TokenDissociateTransaction();
  const result = await tokenAssociationTransaction(
    tx,
    tokenId,
    account,
    user,
    "token successfully dissociated"
  );
  if (result.status) {
    const transaction = {
      id: result.transactionId,
      type: "tokenDissociate",
      inputs: "tokenId=" + tokenId + ", AccountId=" + account.accountId
    };
    EventBus.$emit("addTransaction", transaction);
  }
  return result.status;
}

export async function tokenTransfer(tokenId, user, quantity, destination) {
  const account = getAccountDetails(user);
  const client = hederaClientForUser(user);
  try {
    const tx = await new TransferTransaction();
    tx.addTokenTransfer(tokenId, account.accountId, -quantity);
    tx.addTokenTransfer(tokenId, destination, quantity);
    tx.setMaxTransactionFee(new Hbar(1));

    const result = await tx.execute(client);

    const transactionReceipt = await result.getReceipt(client);

    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return false;
    } else {
      // force refresh
      await store.dispatch("fetch");
      notifySuccess("tokens transferred successfully");
      const transaction = {
        id: result.transactionId.toString(),
        type: "tokenTransfer",
        inputs:
          "tokenId=" +
          tokenId +
          ", from=" +
          account.accountId +
          ", to=" +
          destination +
          ", amount=" +
          quantity
      };
      EventBus.$emit("addTransaction", transaction);
      return true;
    }
  } catch (err) {
    notifyError(err.message);
    return false;
  }
}

export async function tokenDelete(token) {
  const client = ownerClient();
  try {
    let tx = await new TokenDeleteTransaction();
    tx.setTokenId(token.tokenId);
    tx.setMaxTransactionFee(new Hbar(1));

    await tx.signWithOperator(client);
    if (typeof token.adminKey !== "undefined") {
      await tx.sign(PrivateKey.fromString(token.adminKey));
    }

    const response = await tx.execute(client);

    const transactionReceipt = await response.getReceipt(client);

    if (transactionReceipt.status !== Status.SUCCESS) {
      notifyError(transactionReceipt.status.toString());
      return false;
    } else {
      // force refresh
      await store.dispatch("fetch");
      notifySuccess("Token deleted successfully");
      const transaction = {
        id: response.transactionId.toString(),
        type: "tokenDelete",
        inputs: "tokenId=" + token.tokenId
      };
      EventBus.$emit("addTransaction", transaction);
      return true;
    }
  } catch (err) {
    notifyError(err.message);
    return false;
  }
}
