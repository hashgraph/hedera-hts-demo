import { hederaClient, hederaClientForUser } from "./client";
import { getAccountDetails, notifyError, notifySuccess } from "../utils";
import state from "../store/store";
import { EventBus } from "@/eventBus";
import store from "@/store/store";
import { getPrivateKeyForAccount } from "@/utils";

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

function issuerClient() {
  return hederaClientForUser("Issuer");
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
  const issuerAccount = getAccountDetails("Issuer").accountId.toString();
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
    tx.setAutoRenewPeriod(autoRenewPeriod);

    if (token.adminKey) {
      sigKey = PrivateKey.fromString(token.key);
      tx.setAdminKey(sigKey.publicKey);
      additionalSig = true;
    }
    if (token.kycKey) {
      sigKey = PrivateKey.fromString(token.key);
      tx.setKycKey(sigKey.publicKey);
      additionalSig = true;
    }
    if (token.freezeKey) {
      sigKey = PrivateKey.fromString(token.key);
      tx.setFreezeKey(sigKey.publicKey);
      additionalSig = true;
      tx.setFreezeDefault(token.defaultFreezeStatus);
    } else {
      tx.setFreezeDefault(false);
    }
    if (token.wipeKey) {
      additionalSig = true;
      sigKey = PrivateKey.fromString(token.key);
      tx.setWipeKey(sigKey.publicKey);
    }
    if (token.supplyKey) {
      additionalSig = true;
      sigKey = PrivateKey.fromString(token.key);
      tx.setSupplyKey(sigKey.publicKey);
    }
    const client = issuerClient();

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
        autoRenewAccount: issuerAccount,
        autoRenewPeriod: autoRenewPeriod,
        defaultFreezeStatus: token.defaultFreezeStatus,
        kycKey: token.kycKey,
        wipeKey: token.wipeKey,
        freezeKey: token.freezeKey,
        adminKey: token.adminKey,
        supplyKey: token.supplyKey,
        expiry: tokenInfo.expiry,
        isDeleted: false,
        treasury: issuerAccount
      };

      // automatically associate, grant, etc... for marketplace
      tokenAssociate(token.tokenId, "Marketplace").then(() => {
        const marketAccountId = getAccountDetails("Marketplace").accountId;
        notifySuccess("token association with marketplace successful");
        if (token.kycKey) {
          const instruction = {
            tokenId: token.tokenId,
            accountId: marketAccountId
          };
          tokenGrantKYC(instruction);
        }
        if (token.freezeKey && token.defaultFreezeStatus) {
          const instruction = {
            tokenId: token.tokenId,
            accountId: marketAccountId
          };
          tokenUnFreeze(instruction);
        }
      });
      // force refresh
      await store.dispatch("fetch");
      notifySuccess("token creation successful");
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
  const client = issuerClient();
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
  const client = issuerClient();
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
  const client = issuerClient();
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
  const client = issuerClient();
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
  const client = issuerClient();
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
  const client = issuerClient();
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
  const client = issuerClient();
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
    "token association successful"
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
    "token dissociation succesful"
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

export async function tokenSwap(
  from,
  token1To,
  token1,
  tokenQuantity1,
  token2To,
  token2,
  tokenQuantity2,
  hbarTo,
  hBars
) {
  const account = getAccountDetails(from);
  const client = hederaClientForUser(from);

  try {
    const tx = await new TransferTransaction();
    if (token1 !== "" && token1 !== 0 && tokenQuantity1 !== 0) {
      tx.addTokenTransfer(token1, account.accountId, -tokenQuantity1);
      tx.addTokenTransfer(token1, token1To, tokenQuantity1);
    }
    if (token2 !== "" && token2 !== 0 && tokenQuantity2 !== 0) {
      tx.addTokenTransfer(token2, account.accountId, -tokenQuantity2);
      tx.addTokenTransfer(token2, token2To, tokenQuantity2);
    }
    if (typeof hBars !== "undefined" && hBars !== 0) {
      if (from === "Marketplace") {
        tx.addHbarTransfer(token1To, new Hbar(-hBars));
        tx.addHbarTransfer(hbarTo, new Hbar(hBars));
      } else {
        tx.addHbarTransfer(account.accountId, new Hbar(hBars));
        tx.addHbarTransfer(hbarTo, new Hbar(-hBars));
      }
    }

    tx.freezeWith(client);

    // signature only required if transferring from the 'to' address, but
    // let's sign anyway for now
    //TODO: Only sign if necessary
    if (token1To !== "" && token1To !== "0.0.0" && tokenQuantity1 !== 0) {
      const sigKey = await PrivateKey.fromString(
        getPrivateKeyForAccount(token1To)
      );
      await tx.sign(sigKey);
    }
    if (token2To !== "" && token2To !== "0.0.0" && tokenQuantity2 !== 0) {
      const sigKey = await PrivateKey.fromString(
        getPrivateKeyForAccount(token2To)
      );
      await tx.sign(sigKey);
    }
    if (hbarTo !== "" && hbarTo !== "0.0.0" && hBars !== 0) {
      const sigKey = await PrivateKey.fromString(
        getPrivateKeyForAccount(hbarTo)
      );
      await tx.sign(sigKey);
    }

    const result = await tx.execute(client);
    const transactionReceipt = await result.getReceipt(client);

    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return false;
    } else {
      // force refresh
      await store.dispatch("fetch");
      notifySuccess("tokens transfer successful");
      const transaction = {
        id: result.transactionId.toString(),
        type: "tokenTransfer",
        inputs: ""
      };
      EventBus.$emit("addTransaction", transaction);
      return true;
    }
  } catch (err) {
    notifyError(err.message);
    return false;
  }
}

export async function tokenTransfer(
  tokenId,
  user,
  quantity,
  hbar,
  destination
) {
  const account = getAccountDetails(user);
  const client = hederaClientForUser(user);
  try {
    const tx = await new TransferTransaction();
    tx.addTokenTransfer(tokenId, account.accountId, -quantity);
    tx.addTokenTransfer(tokenId, destination, quantity);
    if (hbar !== 0) {
      // token recipient pays in hBar and signs transaction
      tx.addHbarTransfer(destination, new Hbar(-hbar));
      tx.addHbarTransfer(account.accountId, new Hbar(hbar));
      tx.freezeWith(client);
      const sigKey = await PrivateKey.fromString(
        getPrivateKeyForAccount(destination)
      );
      await tx.sign(sigKey);
    }

    const result = await tx.execute(client);
    const transactionReceipt = await result.getReceipt(client);

    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
      return false;
    } else {
      // force refresh
      await store.dispatch("fetch");
      notifySuccess("tokens transfer successful");
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
  const client = issuerClient();
  try {
    let tx = await new TokenDeleteTransaction();
    tx.setTokenId(token.tokenId);

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
      notifySuccess("Token deletion successful");
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
