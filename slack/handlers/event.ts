import { App } from "@slack/bolt";

  export const registerEventListener = (app: App) => {
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
  }
    