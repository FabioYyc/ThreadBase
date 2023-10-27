import { App } from "@slack/bolt";
import SlackView from "../../slack-view-render";
import { homeBaseView } from "../../views/home/home.view";
import { getCategoryManagementBlocks } from "./category/category.helper";

export const homeTabHandler = (app: App) => {
  app.event("app_home_opened", async ({ event, client }) => {
    try {
      const render = new SlackView(homeBaseView);
      const categoryBlocks = getCategoryManagementBlocks();
      render.appendBlocks(categoryBlocks);

      const view = render.getView();

      await client.views.publish({
        user_id: event.user,
        view: view,
      });
    } catch (error) {}
  });
};
