import { App, GenericMessageEvent } from "@slack/bolt";
import { getMessageInfo } from "../../apis/messages";

export const messageSentHandler = (app: App) => {
  app.event("message", async ({ event, client }) => {
    const eventPayload = event as GenericMessageEvent;
    const messageInfo = await getMessageInfo({
      messageTs: eventPayload.thread_ts || eventPayload.ts,
      channelId: eventPayload.channel,
      senderId: eventPayload.parent_user_id || eventPayload.user,
      isReply: eventPayload.thread_ts !== undefined,
      client,
    });
    console.log(messageInfo);
  });
};
