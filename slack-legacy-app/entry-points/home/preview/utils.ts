import { WebClient } from "@slack/web-api";
import { ISavedThread, threadRepo } from "../../../../common/models/thread";
import { getMessage } from "../../../apis/messages";

export const getMessagesFormThread = async ({ threadId, client }: { threadId: string; client: WebClient }) => {
  const thread = (await threadRepo.getThreadById(threadId)) as ISavedThread;
  if (!thread) {
    console.log("No thread found with id: ", threadId);
  }
  const { channelId, messageTs, senderId, isReply } = thread;

  const message = await getMessage({
    messageTs,
    channelId,
    senderId,
    isReply,
    client,
  });

  return message ? [message] : [];
};
