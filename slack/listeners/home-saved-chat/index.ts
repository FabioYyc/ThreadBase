import { App } from "@slack/bolt";
import { getSavedThreadViewByUser } from "./home-tab-view";
import { editAndDeleteHandlers } from "./edit-and-delete-chat/handler";
import { registerCreateTeamHandlers } from "./teams/handlers";
import { searchButtonHandler, searchModalHandler } from "./search/handlers";
import { previewButtonHandler } from "./preview/handler";


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
    registerCreateTeamHandlers(app);
    searchButtonHandler(app);
    searchModalHandler(app);
    previewButtonHandler(app);
    editAndDeleteHandlers(app);
  }
    