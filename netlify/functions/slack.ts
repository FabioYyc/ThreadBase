import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { App, AckFn, SayFn, ReceiverEvent } from "@slack/bolt";
import { ExpressReceiver } from "@slack/bolt";
import express from "express";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  }),
});

function parseRequestBody(stringBody: string | null, contentType: string | undefined) {
  try {
    let inputStringBody: string = stringBody ?? "";
    let result: any = {};

    if (contentType && contentType === 'application/x-www-form-urlencoded') {
      var keyValuePairs = inputStringBody.split('&');
      keyValuePairs.forEach(function(pair: string): void {
        let individualKeyValuePair: string[] = pair.split('=');
        result[individualKeyValuePair[0]] = decodeURIComponent(individualKeyValuePair[1] || '');
      });
      return JSON.parse(JSON.stringify(result));
    } else {
      return JSON.parse(inputStringBody);
    }
  } catch {
    return undefined;
  }
}

  app.event('app_home_opened', async ({ event, client, context }) => {
    try {
      /* view.publish is the method that your app uses to push a view to the Home tab */
      console.log('getting app home opened event')
      const result = await client.views.publish({
  
        /* the user that opened your app's app home */
        user_id: event.user,
  
        /* the view object that appears in the app home*/
        view: {
          type: 'home',
          callback_id: 'home_view',
  
          /* body of the view */
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*Recently saved threads* :memo:"
              }
            },
            {
              "type": "divider"
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Search your knowledge base :mag:"
                  }
                }
              ]
            }
          ]
        }
      });
    }
    catch (error) {
      console.error(error);
    }
  });
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
      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  });
  
const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const payload = parseRequestBody(event.body, event.headers['content-type']);
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
