import { App } from "@slack/bolt";
import SlackView from "../../slack-view-render";
import { homeBaseView } from "../../views/home/home.view";
import { editCategoryButtonHandler } from "./sub-handlers/category/category.handler";
import { AbstractHomeBlocks } from "./blocks-retrievers/abstract-home-blocks-retriever";
import { getBlockRetriever } from "./utils";

const homeTabHandler = (app: App) => {
  app.event("app_home_opened", async ({ event, client }) => {
    try {
      const blockRetriever: AbstractHomeBlocks = getBlockRetriever();
      const render = new SlackView(homeBaseView);
      const categoryBlocks = blockRetriever.getBlocks();
      render.appendBlocks(categoryBlocks);

      const view = render.getView();

      await client.views.publish({
        user_id: event.user,
        view: view,
      });
    } catch (error) {}
  });
};

export const registerHomeTabListeners = (app: App) => {
  homeTabHandler(app);
  editCategoryButtonHandler(app);
};
