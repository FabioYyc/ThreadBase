import { App, View } from "@slack/bolt";
import { threadRepo } from "../../module/thread";
import { getSavedThreadViewByUser, noSavedThreadsView, savedThreadExistsView } from "./views";
import { deleteChatConfirm, deleteChatProcessor } from "./delete-chat";


const homeOpenListener = (app: App) => {

  app.event('app_home_opened', async ({ event, client, context }) => {
    try {
      /* view.publish is the method that your app uses to push a view to the Home tab */
      const view = await getSavedThreadViewByUser(event.user);

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

  export const registerHomeTabListeners = (app: App) => {
    homeOpenListener(app);
    deleteChatConfirm(app);
    deleteChatProcessor(app);
  }
    