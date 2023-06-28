import { App, View } from "@slack/bolt";
import { threadRepo } from "../../module/thread";
import { noSavedThreadsView, savedThreadExistsView } from "./views";

  export const registerHomeTabListener = (app: App) => {
    app.event('app_home_opened', async ({ event, client, context }) => {
        try {
          /* view.publish is the method that your app uses to push a view to the Home tab */
          console.log('getting app home opened event')
          const threads = await threadRepo.getSavedThreadForUser(event.user);
          let view: View = noSavedThreadsView;
          
          if (threads.length > 0) {
            view = savedThreadExistsView(threads);
          }

          const result = await client.views.publish({

            /* the user that opened your app's app home */
            user_id: event.user,
            /* the view object that appears in the app home*/
            view,
          });
        }
        catch (error) {
          console.error(error);
        }
      });
  }
    