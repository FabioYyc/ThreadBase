import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { App, MessageShortcut, OptionsSource, ReceiverEvent, SlackAction, SlackActionMiddlewareArgs, SlackCommandMiddlewareArgs, SlackEventMiddlewareArgs, SlackOptionsMiddlewareArgs, SlackShortcutMiddlewareArgs } from "@slack/bolt";
import { ExpressReceiver } from "@slack/bolt";
import { registerEventListener } from "../../slack/handlers/event";
import { parseRequestBody } from "../../slack/utils";
import { registerSaveChatHandler } from "../../slack/handlers/save-chat";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET as string,
  }),
});
  registerEventListener(app);
  registerSaveChatHandler(app);
  app.command('/addbase', async ({ ack, payload, context }) => {
    // Acknowledge the command request
    console.log('getting add base command')
  
    try {
      const result = await app.client.chat.postMessage({
        token: context.botToken,
        // Channel to send message to
        channel: payload.channel_id,
        // Include a button in the message (or whatever blocks you want!)
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Confirm adding to your knowledge base :tada:'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          }
        ],
        // Text in the notification
        text: 'Message from Test App'
      });
    }
    catch (error) {
      console.error(error);
    }
  });


const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  let payload = parseRequestBody(event.body, event.headers['content-type']);

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
