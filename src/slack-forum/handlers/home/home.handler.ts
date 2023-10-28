import { App } from "@slack/bolt";
import { homeBaseView } from "../../views/home/home.view";
import { AbstractHomeBlocks } from "./blocks-retrievers/abstract-home-blocks-retriever";
import { getBlockRetriever } from "./utils";
import HomeTabViewRender from "../../shared/view-render/home-tab-view-render";
import { registerCategoryHandlers } from "./sub-handlers/category";

const homeTabHandler = (app: App) => {
  app.event("app_home_opened", async ({ event, client }) => {
    try {
      const blockRetriever: AbstractHomeBlocks = getBlockRetriever();
      const render = new HomeTabViewRender(homeBaseView);
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
  registerCategoryHandlers(app);
};
