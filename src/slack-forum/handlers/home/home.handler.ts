import { App } from "@slack/bolt";
import { registerCategoryHandlers } from "./sub-handlers/category";
import { generateHomeView } from "./home-view-generate";

const homeTabHandler = (app: App) => {
  app.event("app_home_opened", async ({ body, event, client }) => {
    try {
      const orgId = body.team_id;

      const view = await generateHomeView(orgId, "category");

      await client.views.publish({
        user_id: event.user,
        view: view,
      });
    } catch (error) {}
  });
};

export const registerHomeTabListeners = (app: App) => {
  homeTabHandler(app);
  registerCategoryHandlers(app);
};
