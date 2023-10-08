import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { App, ReceiverEvent } from "@slack/bolt";
import { ExpressReceiver } from "@slack/bolt";
import { registerHomeTabListeners } from "../../../slack/entry-points/home";
import { parseRequestBody } from "../../../slack/utils";
import { registerSaveChatHandler } from "../../../slack/entry-points/save-chat/handlers";
import mongoose from "mongoose";
import { registerConfluenceHandlers } from "../../../slack/entry-points/save-confluence/handlers";
import { slackInstallationRepo } from "../../../common/models/slack-installation";
import { configReminderHandler } from "../../../slack/entry-points/ commands/reminder-setting/handler";

mongoose.connect(process.env.MONGO_DB_URL as string);

const authorizeFn = async ({ teamId, enterpriseId }: any) => {
  const installation = await slackInstallationRepo.getByTeamId(teamId);
  if (!installation) {
    throw new Error("No installation found");
  }
  return {
    botToken: installation.botToken,
    botId: installation.botId,
    botUserId: installation.botUserId,
  };
};

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET as string,
  }),
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  authorize: authorizeFn,
});

registerHomeTabListeners(app);
registerSaveChatHandler(app);
registerConfluenceHandlers(app);

configReminderHandler(app);

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const payload = parseRequestBody(event.body, event.headers["content-type"]);

  if (payload && payload.type && payload.type === "url_verification") {
    return {
      statusCode: 200,
      body: payload.challenge,
    };
  }

  if (payload && payload.type && payload.type === "keep_warm") {
    return {
      statusCode: 200,
      body: "ok",
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
