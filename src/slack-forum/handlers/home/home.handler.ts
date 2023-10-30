import { App } from "@slack/bolt";
import { registerCategoryHandlers } from "./sub-handlers/category";
import { generateHomeView } from "./home-view-generate";
import { HomeActionIds } from "../../shared/constants/home.constants";

const homeTabHandler = (app: App) => {
  app.event("app_home_opened", async ({ body, event, client }) => {
    try {
      const orgId = body.team_id;
      const defaultBlocksRetrieverId = "category";
      const view = await generateHomeView(orgId, defaultBlocksRetrieverId);

      await client.views.publish({
        user_id: event.user,
        view: view,
      });
    } catch (error) {}
  });

  app.action(HomeActionIds.ManageCategoryActionId, async ({ ack, body, client }) => {
    await ack();
    if (!body.team) throw new Error("Team not found");
    const orgId = body.team.id;
    const view = await generateHomeView(orgId, "category");

    await client.views.publish({
      user_id: body.user.id,
      view: view,
    });
  });

  app.action(HomeActionIds.ManageTopicActionId, async ({ ack, body, client }) => {
    await ack();
    if (!body.team) throw new Error("Team not found");
    const orgId = body.team.id;
    const view = await generateHomeView(orgId, "topic");

    await client.views.publish({
      user_id: body.user.id,
      view: view,
    });
  });
};

export const registerHomeTabListeners = (app: App) => {
  homeTabHandler(app);
  registerCategoryHandlers(app);
};
