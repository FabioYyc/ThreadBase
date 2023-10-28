import { App, BlockAction, DialogSubmitAction, ViewWorkflowStepSubmitAction } from "@slack/bolt";
import {
  CategoryActionIds,
  CategoryFieldIds,
  categoryIdPrefix,
} from "../../../../shared/constants/category.constants";
import {
  categoryBaseModalView,
  editOrCreateViewBlocks,
} from "../../../../views/home/category.view";
import SlackModalView from "../../../../shared/view-render/modal-view-render";
import { valueParser } from "../../../../shared/utils/value-parser";
import { parseEditOrCreateCategoryValue } from "./utils";
import { Category } from "../../../../types/Category";
import { uniqueId } from "lodash";
import { CategoryService } from "../../../../data-service/category/category.service";

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
  const categoryService = new CategoryService();
  app.view(CategoryActionIds.AddCategoryCallback, async ({ ack, body, context, client }) => {
    await ack();
    body = body as ViewWorkflowStepSubmitAction;
    const parsedCategoryValue = parseEditOrCreateCategoryValue(body.view);

    const newCategory: Category = {
      id: uniqueId(categoryIdPrefix),
      name: parsedCategoryValue[CategoryFieldIds.Name],
      description: parsedCategoryValue[CategoryFieldIds.Description],
      linkedChannel: parsedCategoryValue[CategoryFieldIds.Channel],
    };

    const createdCategory = await categoryService.createCategory(newCategory);
    console.log(createdCategory);
  });
};

export const registerCategoryCreateOrEditListeners = (app: App) => {
  editOrCreateCategoryButtonHandler(app);
  categorySubmitHandler(app);
};
