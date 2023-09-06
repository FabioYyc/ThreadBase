import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { App, ReceiverEvent } from "@slack/bolt";
import { ExpressReceiver } from "@slack/bolt";
import { registerHomeTabListeners } from "../../slack/entry-points/home";
import { parseRequestBody } from "../../slack/utils";
import { registerSaveChatHandler } from "../../slack/entry-points/save-chat/handlers";
import mongoose from "mongoose";
import { registerConfluenceHandlers } from "../../slack/entry-points/save-confluence/handlers";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET as string,
  }),
});
mongoose.connect(process.env.MONGO_DB_URL as string);

registerHomeTabListeners(app);
registerSaveChatHandler(app);
registerConfluenceHandlers(app);

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const payload = parseRequestBody(event.body, event.headers["content-type"]);

  if (payload && payload.type && payload.type === "url_verification") {
    return {
      statusCode: 200,
      body: payload.challenge,
    };
  }

  const slackEvent: ReceiverEvent = {
    body: payload,
    ack: async (response) => {
      return new Promise<void>((resolve, reject) => {
        resolve();
        return {
          statusCode: 200,
          body: response ?? "",
        };
      });
    },
  };
  await app.processEvent(slackEvent);
  return {
    statusCode: 201,
  };
};

export { handler };
