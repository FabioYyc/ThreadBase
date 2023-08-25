import { App } from "@slack/bolt";
import { ISavedThread, threadRepo } from "../../../../common/modles/thread";
import { getMessage } from "../../../apis/messages";

export const getMessagesFormThread = async ({ threadId, app }: { threadId: string; app: App }) => {
  const thread = (await threadRepo.getThreadById(threadId)) as ISavedThread;
  const { channelId, messageTs, senderId, isReply } = thread;

  const message = await getMessage({
    messageTs,
    channelId,
    senderId,
    isReply,
    app,
  });

  return message ? [message] : [];
};
