import { App, BlockAction, ViewWorkflowStepSubmitAction } from "@slack/bolt";
import {
  CategoryActionIds,
  CategoryFieldIds,
} from "../../../../shared/constants/category.constants";
import {
  categoryBaseModalView,
  editOrCreateViewBlocks,
} from "../../../../views/home/category.view";
import SlackModalView from "../../../../shared/view-render/modal-view-render";
import { generateId, parseEditOrCreateCategoryValue } from "./utils";
import { Category } from "../../../../types/Category";
import { CategoryService } from "../../../../data-service/category/category.service";
import { generateHomeView } from "../../home-view-generate";

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
    const orgId = body.team?.id;
    if (!orgId) {
      throw new Error("No team found");
    }
    const parsedCategoryValue = parseEditOrCreateCategoryValue(body.view);

    const newCategory: Category = {
      id: generateId(orgId),
      name: parsedCategoryValue[CategoryFieldIds.Name],
      description: parsedCategoryValue[CategoryFieldIds.Description],
      linkedChannel: parsedCategoryValue[CategoryFieldIds.Channel],
    };

    await categoryService.createCategory(newCategory, orgId);
    const view = await generateHomeView(orgId, "category");
    await client.views.publish({
      user_id: body.user.id,
      view: view,
    });
  });
};

export const registerCategoryCreateOrEditListeners = (app: App) => {
  editOrCreateCategoryButtonHandler(app);
  categorySubmitHandler(app);
};
