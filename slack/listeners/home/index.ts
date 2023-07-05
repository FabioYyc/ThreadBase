import { App } from "@slack/bolt";
import { getSavedThreadViewByUser } from "./home-tab-view";
import { deleteChatConfirm, deleteChatProcessor } from "./delete-chat";
import { registerCreateTeamHandlers } from "./teams/handlers";


const homeOpenListener = (app: App) => {

  app.event('app_home_opened', async ({ event, client, body }) => {
    try {
      const orgId = body.team_id;
      /* view.publish is the method that your app uses to push a view to the Home tab */
      const view = await getSavedThreadViewByUser(orgId, event.user);
       await client.views.publish({

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
    registerCreateTeamHandlers(app);
  }
    