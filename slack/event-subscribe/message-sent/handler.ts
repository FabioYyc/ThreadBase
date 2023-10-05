import { App, GenericMessageEvent } from "@slack/bolt";
import { getMessageInfo, sendChannelMessage } from "../../apis/messages";
import { createOrUpdateConvoWithReplyCount, replyCountExceedsThreshold } from "./utils";
import { reminderMessage } from "./view";

export const messageSentHandler = (app: App) => {
  app.event("message", async ({ event, client }) => {
    const eventPayload = event as GenericMessageEvent;

    if (!eventPayload.team) {
      throw new Error("Team ID is not defined in message event payload");
    }
    const messageInfo = await getMessageInfo({
      messageTs: eventPayload.thread_ts || eventPayload.ts,
      channelId: eventPayload.channel,
      senderId: eventPayload.parent_user_id || eventPayload.user,
      isReply: eventPayload.thread_ts !== undefined,
      client,
    });
    const parentMessage = messageInfo.messages?.filter((message) => message.thread_ts)[0];

    if (eventPayload.thread_ts && parentMessage) {
      const replyCount = Number(parentMessage.reply_count);
      let reminderSent = false;
      if (replyCountExceedsThreshold(replyCount, eventPayload.channel)) {
        await sendChannelMessage({
          client,
          channelId: eventPayload.channel,
          blocks: reminderMessage,
          text: reminderMessage[0].text?.text || "",
          threadTs: eventPayload.thread_ts,
        });
        reminderSent = true;
      }
      await createOrUpdateConvoWithReplyCount({
        threadTs: eventPayload.thread_ts,
        channelId: eventPayload.channel,
        threadSenderId: eventPayload.parent_user_id || eventPayload.user,
        teamId: eventPayload.team,
        replyCount: replyCount,
        reminderSent,
      });
    }
  });
};
