import { notifyError, notifySuccess } from "../utils";
import { EventBus } from "@/eventBus";
import { hederaClient } from "@/service/client";

import { Blob, NFTStorage } from "nft.storage";

const {
  FileContentsQuery,
  FileCreateTransaction,
  FileUpdateTransaction,
  FileAppendTransaction,
  FileId,
  PrivateKey,
  Status
} = require("@hashgraph/sdk");

export async function fileGetContents(fileId, storageProtocol = "HEDERA") {
  if (storageProtocol === "HEDERA") {
    // Get file from Hedera File Storage
    const client = hederaClient();
    let info = {};
    try {
      info = await new FileContentsQuery()
        .setFileId(FileId.fromString(fileId))
        .execute(client);
    } catch (err) {
      notifyError(err.message);
    }
    return info;
  } else if (storageProtocol === "IPFS") {
    // Get file from IPFS storage using Cloudflare IPFS Gateway
    return await fetch(`https://cloudflare-ipfs.com/ipfs/${fileId}`);
  }
}

export async function fileCreate(fileData, storage = "HEDERA") {
  if (storage === "HEDERA" || storage === undefined) {
    // Publish file to Hedera File Service storage
    const privateKey = PrivateKey.fromString(process.env.VUE_APP_OPERATOR_KEY);
    const client = hederaClient();
    let fileId = "";
    const fileChunk = 4000;
    const largeFile = fileData.length > fileChunk;
    let startIndex = 0;
    try {
      const keys = [];
      keys.push(privateKey);
      const fileCreateTransaction = new FileCreateTransaction();

      if (largeFile) {
        // if we have a large file (> 4000 bytes), create the file with keys
        // then run file append
        // then remove keys
        fileCreateTransaction.setContents(fileData.slice(0, fileChunk));
        fileCreateTransaction.setKeys(keys);
      } else {
        fileCreateTransaction.setContents(fileData);
      }

      let response = await fileCreateTransaction.execute(client);
      let transactionReceipt = await response.getReceipt(client);

      if (transactionReceipt.status !== Status.Success) {
        notifyError(transactionReceipt.status.toString());
        return "";
      }

      fileId = transactionReceipt.fileId.toString();

      const transaction = {
        id: response.transactionId.toString(),
        type: "fileCreate",
        inputs: fileData.substr(0, 20),
        outputs: "fileId=" + fileId
      };

      startIndex = startIndex + fileChunk;
      let chunks = 1;
      while (startIndex <= fileData.length) {
        notifySuccess("Saving token properties file chunk " + chunks);
        chunks += 1;
        // sleep 500ms to avoid duplicate tx errors
        await new Promise(r => setTimeout(r, 500));
        // append to file
        response = await new FileAppendTransaction()
          .setContents(fileData.slice(startIndex, startIndex + fileChunk))
          .setFileId(FileId.fromString(fileId))
          .execute(client);
        let transactionReceipt = await response.getReceipt(client);

        if (transactionReceipt.status !== Status.Success) {
          notifyError(transactionReceipt.status.toString());
          return "";
        }
        startIndex = startIndex + fileChunk;
      }

      EventBus.$emit("addTransaction", transaction);

      if (largeFile) {
        // remove keys
        response = await new FileUpdateTransaction()
          .setKeys([])
          .setFileId(FileId.fromString(fileId))
          .execute(client);
        transactionReceipt = await response.getReceipt(client);

        if (transactionReceipt.status !== Status.Success) {
          notifyError(transactionReceipt.status.toString());
          return "";
        }

        notifySuccess("Token properties file created");
      }
    } catch (err) {
      notifyError(err.message);
      console.error(err);

      return "";
    }

    return fileId;
  } else {
    // Store file in IPFS
    try {
      const NFT_STORAGE_API_KEY = process.env.VUE_APP_NFT_STORAGE_API_KEY;
      if (NFT_STORAGE_API_KEY) {
        const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });
        const content = new Blob([fileData], { type: "application/json" });
        return await nftStorageClient.storeBlob(content);
      } else {
        const NO_API_KEY_ERROR =
          "You don't seem to have an NFT.STORAGE API key in your .env file. Please\n" +
          "      get a new API key at https://nft.storage/, add it to .env file and restart\n" +
          "      the server.";
        notifyError(NO_API_KEY_ERROR);
        console.error(NO_API_KEY_ERROR);

        return "";
      }
    } catch (err) {
      notifyError(err.message);
      console.error(err);

      return "";
    }
  }
}
