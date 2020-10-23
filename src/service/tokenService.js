import {hederaClient, hederaClientForUser} from "./client";
import {getAccountDetails, notifyError, notifySuccess} from "../utils";
import state from "../store/store";
import {
    TokenAssociateTransaction,
    TokenBurnTransaction, TokenDeleteTransaction, TokenDissociateTransaction,
    TokenFreezeTransaction, TokenGrantKycTransaction, TokenInfoQuery,
    TokenMintTransaction, TokenRevokeKycTransaction, TokenTransferTransaction,
    TokenUnfreezeTransaction,
    TokenWipeTransaction
} from "@hashgraph/sdk";
import BigNumber from "bignumber.js";

const {
    Ed25519PrivateKey,
    TokenCreateTransaction,
    Hbar
} = require("@hashgraph/sdk");

function ownerClient() {
    return hederaClientForUser("owner");
}

export async function tokenGetInfo(token) {
    const client = hederaClient();
    const tokenResponse = token;
    try {
        const info = await new TokenInfoQuery().setTokenId(token.tokenId).execute(client);

        tokenResponse.totalSupply = info.totalSupply;
    } catch (err) {
        notifyError(err.message);
    }

    return tokenResponse;
}

export async function tokenCreate(token) {
    const operatorAccount = process.env.VUE_APP_OPERATOR_ID;
    let tokenResponse = {};
    const autoRenewPeriod = 7776000;  // set to default 3 months

    // get private key and account for owner from accounts
    try {
        let additionalSig = false;
        let sigKey;
        const tx = await new TokenCreateTransaction();
        tx.setName(token.name);
        tx.setSymbol(token.symbol.toUpperCase());
        tx.setDecimals(token.decimals);
        tx.setInitialSupply(token.initialSupply);
        tx.setTreasury(token.treasury);
        tx.setAutoRenewAccount(token.autoRenewAccount);
        tx.setMaxTransactionFee(new Hbar(1));
        tx.setAutoRenewPeriod(autoRenewPeriod);

        if (token.adminKey) {
            sigKey = Ed25519PrivateKey.fromString(token.adminKey);
            tx.setAdminKey(sigKey.publicKey);
            additionalSig = true;
        }
        if (token.kycKey) {
            sigKey = Ed25519PrivateKey.fromString(token.adminKey);
            tx.setKycKey(sigKey.publicKey);
            additionalSig = true;
        }
        if (token.freezeKey) {
            sigKey = Ed25519PrivateKey.fromString(token.adminKey);
            tx.setFreezeKey(sigKey.publicKey);
            additionalSig = true;
            tx.setFreezeDefault(token.defaultFreezeStatus);
        } else {
            tx.setFreezeDefault(false);
        }
        if (token.wipeKey) {
            additionalSig = true;
            sigKey = Ed25519PrivateKey.fromString(token.adminKey);
            tx.setWipeKey(sigKey.publicKey);
        }
        if (token.supplyKey) {
            additionalSig = true;
            sigKey = Ed25519PrivateKey.fromString(token.adminKey);
            tx.setSupplyKey(sigKey.publicKey);
        }
        const client = ownerClient();
        let txToRun = await tx.build(client);

        if (additionalSig) {
            // TODO: should sign with every key (check docs)
            // since the admin/kyc/... keys are all the same, a single sig is sufficient
            await txToRun.sign(sigKey);
        }

        const transactionId = await txToRun.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);

        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
        } else {
            const newTokenId = transactionReceipt.getTokenId();
            tokenResponse = {
                tokenId: newTokenId.toString(),
                symbol: token.symbol.toUpperCase(),
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
        notifyError(err.message);
        return {};
    }
}

async function tokenTransactionWithAmount(client, transaction, instruction, key) {
    try {
        transaction.setTokenId(instruction.tokenId);
        if (typeof instruction.accountId !== "undefined") {
            transaction.setAccountId(instruction.accountId);
        }
        transaction.setAmount(new BigNumber(instruction.amount));
        transaction.setMaxTransactionFee(new Hbar(1));

        const txToRun = await transaction.build(client);
        await txToRun.sign(key);

        const transactionId = await txToRun.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);
        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
            return false;
        }
        notifySuccess(instruction.successMessage);
    } catch (err) {
        console.error(err);
        notifyError(err.message);
        return false;
    }
    return true;
}

async function tokenTransactionWithIdAndAccount(client, transaction, instruction, key) {
    try {
        transaction.setTokenId(instruction.tokenId);
        transaction.setAccountId(instruction.accountId);
        transaction.setMaxTransactionFee(new Hbar(1));

        const txToRun = await transaction.build(client);
        await txToRun.sign(key);

        const transactionId = await txToRun.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);
        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
            return false;
        }

        notifySuccess(instruction.successMessage);
    } catch (err) {
        console.error(err);
        notifyError(err.message);
        return false;
    }
    return true;
}

export async function tokenBurn(instruction) {
    instruction.successMessage = "Burnt " + instruction.amount + " from token " + instruction.tokenId;
    const token = state.getters.getTokens[instruction.tokenId];
    const supplyKey = Ed25519PrivateKey.fromString(token.supplyKey)
    const tx = await new TokenBurnTransaction();
    const client = ownerClient();
    return await tokenTransactionWithAmount(client, tx, instruction, supplyKey);
}

export async function tokenMint(instruction) {
    instruction.successMessage = "Minted " + instruction.amount + " for token " + instruction.tokenId;
    const token = state.getters.getTokens[instruction.tokenId];
    const supplyKey = Ed25519PrivateKey.fromString(token.supplyKey)
    const tx = await new TokenMintTransaction();
    const client = ownerClient();
    return await tokenTransactionWithAmount(client, tx, instruction, supplyKey);
}

export async function tokenWipe(instruction) {
    instruction.successMessage = "Wiped " + instruction.amount + " from account " + instruction.accountId;
    const token = state.getters.getTokens[instruction.tokenId];
    const supplyKey = Ed25519PrivateKey.fromString(token.wipeKey)
    const tx = await new TokenWipeTransaction();
    const client = ownerClient();
    return await tokenTransactionWithAmount(client, tx, instruction, supplyKey);
}

export async function tokenFreeze(instruction) {
    const token = state.getters.getTokens[instruction.tokenId];
    const freezeKey = Ed25519PrivateKey.fromString(token.freezeKey)
    const tx = await new TokenFreezeTransaction();
    instruction.successMessage = "Account " + instruction.accountId + " frozen";
    const client = ownerClient();
    return tokenTransactionWithIdAndAccount(client, tx, instruction, freezeKey);
}

export async function tokenUnFreeze(instruction) {
    const token = state.getters.getTokens[instruction.tokenId];
    const freezeKey = Ed25519PrivateKey.fromString(token.freezeKey)
    const tx = await new TokenUnfreezeTransaction();
    instruction.successMessage = "Account " + instruction.accountId + " defrosted";
    const client = ownerClient();
    return tokenTransactionWithIdAndAccount(client, tx, instruction, freezeKey);
}

export async function tokenGrantKYC(instruction) {
    const token = state.getters.getTokens[instruction.tokenId];
    const kycKey = Ed25519PrivateKey.fromString(token.kycKey)
    const tx = await new TokenGrantKycTransaction();
    instruction.successMessage = "Account " + instruction.accountId + " KYC Granted";
    const client = ownerClient();
    return tokenTransactionWithIdAndAccount(client, tx, instruction, kycKey);
}

export async function tokenRevokeKYC(instruction) {
    const token = state.getters.getTokens[instruction.tokenId];
    const kycKey = Ed25519PrivateKey.fromString(token.kycKey)
    const tx = await new TokenRevokeKycTransaction();
    instruction.successMessage = "Account " + instruction.accountId + " KYC Revoked";
    const client = ownerClient();
    return tokenTransactionWithIdAndAccount(client, tx, instruction, kycKey);
}

async function tokenAssociationTransaction(transaction, tokenId, user, message) {
    const account = getAccountDetails(user);
    const client = hederaClientForUser(user);

    const userKey = Ed25519PrivateKey.fromString(account.privateKey);

    try {
        transaction.addTokenId(tokenId);
        transaction.setAccountId(account.accountId);
        transaction.setMaxTransactionFee(new Hbar(1));

        const txToRun = await transaction.build(client);
        await txToRun.sign(userKey);

        const transactionId = await txToRun.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);
        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
            return false;
        }

        notifySuccess(message);
    } catch (err) {
        console.error(err);
        notifyError(err.message);
        return false;
    }
    return true;
}

export async function tokenAssociate(tokenId, user) {
    const tx = await new TokenAssociateTransaction();
    return tokenAssociationTransaction(tx, tokenId, user, "token successfully associated");
}

export async function tokenDissociate(tokenId, user) {
    const tx = await new TokenDissociateTransaction();
    return tokenAssociationTransaction(tx, tokenId, user, "token successfully dissociated");
}

export async function tokenTransfer(tokenId, user, quantity, destination) {
    const account = getAccountDetails(user);
    const client = hederaClientForUser(user);
    try {
        const tx = await new TokenTransferTransaction();
        tx.addSender(tokenId, account.accountId, new BigNumber(quantity));
        tx.addRecipient(tokenId, destination, new BigNumber(quantity));
        tx.setMaxTransactionFee(new Hbar(1));

        const transactionId = await tx.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);

        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
            return false;
        } else {
            notifySuccess("tokens transferred successfully");
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

        if (typeof token.adminKey !== "undefined") {
            tx = tx.build(client);
            tx.sign(Ed25519PrivateKey.fromString(token.adminKey));
        }

        const transactionId = await tx.execute(client);

        const transactionReceipt = await transactionId.getReceipt(client);

        if (transactionReceipt.status._isError()) {
            notifyError(transactionReceipt.status.message);
            return false;
        } else {
            notifySuccess("Token deleted successfully");
            return true;
        }

    } catch (err) {
        notifyError(err.message);
        return false;
    }
}
