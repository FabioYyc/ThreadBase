import { App, BlockAction, DialogSubmitAction, ViewWorkflowStepSubmitAction } from "@slack/bolt";
import {
  CategoryActionIds,
  CategoryFieldIds,
} from "../../../../shared/constants/category.constants";
import {
  categoryBaseModalView,
  editOrCreateViewBlocks,
} from "../../../../views/home/category.view";
import SlackModalView from "../../../../shared/view-render/modal-view-render";
import { valueParser } from "../../../../shared/utils/value-parser";
import { parseEditOrCreateCategoryValue } from "./utils";

const editOrCreateCategoryButtonHandler = async (app: App) => {
  app.action(CategoryActionIds.AddCategory, async ({ ack, body, context, client }) => {
    await ack();
    const render = new SlackModalView(categoryBaseModalView);

    body = body as BlockAction;
    render.setTitle("Add Category");
    render.appendBlocks(editOrCreateViewBlocks({}));
    render.setCallbackId(CategoryActionIds.AddCategoryCallback);
    const view = render.getView();
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view,
      });
    } catch (error) {
      console.error(error);
    }
  });

  app.action(CategoryActionIds.EditCategory, async ({ ack, body, context, client }) => {
    await ack();
    const render = new SlackModalView(categoryBaseModalView);

    body = body as BlockAction;
    const testCategory = {
      name: "General",
      id: "1",
      linkedChannel: "general",
    };
    render.setTitle("Edit Category");
    render.appendBlocks(editOrCreateViewBlocks(testCategory));
    const view = render.getView();
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view,
      });
    } catch (error) {
      console.error(error);
    }
  });
};

export const categorySubmitHandler = async (app: App) => {
  app.view(CategoryActionIds.AddCategoryCallback, async ({ ack, body, context, client }) => {
    await ack();
    body = body as ViewWorkflowStepSubmitAction;
    const parsedCategoryValue = parseEditOrCreateCategoryValue(body.view);

    console.log(parsedCategoryValue);
  });
};

export const registerCategoryCreateOrEditListeners = (app: App) => {
  editOrCreateCategoryButtonHandler(app);
  categorySubmitHandler(app);
};
