import { hederaClientForUser } from "./client";
import { notifyError, notifySuccess } from "../utils";
import { EventBus } from "@/eventBus";

const {
  FileContentsQuery,
  FileCreateTransaction,
  FileId,
  Status
} = require("@hashgraph/sdk");

function ownerClient() {
  return hederaClientForUser("owner");
}

export async function fileGetContents(fileId) {
  const client = ownerClient();
  let info = {};
  try {
    info = await new FileContentsQuery()
      .setFileId(FileId.fromString(fileId))
      .execute(client);
  } catch (err) {
    notifyError(err.message);
  }
  return info;
}

export async function fileCreate(fileData) {
  const client = ownerClient();
  let fileId = "";
  // const autoRenewPeriod = 7776000; // set to default 3 months
  try {
    const response = await new FileCreateTransaction()
        .setContents(fileData)
        .execute(client);
    const transactionReceipt = await response.getReceipt(client);

    if (transactionReceipt.status !== Status.Success) {
      notifyError(transactionReceipt.status.toString());
    } else {
      fileId = transactionReceipt.fileId.toString();

      const transaction = {
        id: response.transactionId.toString(),
        type: "fileCreate",
        inputs: fileData.substr(0, 20),
        outputs: "fileId=" + fileId
      };
      EventBus.$emit("addTransaction", transaction);

      notifySuccess("file created successfully");
    }
  } catch (err) {
    notifyError(err.message);
  }
  return fileId;
}
