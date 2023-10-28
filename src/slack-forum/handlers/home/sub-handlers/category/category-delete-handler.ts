import { App, BlockAction, Button, ViewWorkflowStepSubmitAction } from "@slack/bolt";
import { CategoryActionIds } from "../../../../shared/constants/category.constants";
import SlackModalView from "../../../../shared/view-render/modal-view-render";
import { deleteCategoryConfirmModal } from "../../../../views/home/category/category.delete.view";
import { CategoryService } from "../../../../data-service/category/category.service";
import { generateHomeView } from "../../home-view-generate";

export const deleteButtonHandler = async (app: App) => {
  app.action(CategoryActionIds.DeleteCategoryAction, async ({ ack, body, context, client }) => {
    await ack();
    body = body as BlockAction;
    const action = body.actions[0] as Button;
    if (!action.value) {
      throw new Error("No value found");
    }
    const render = new SlackModalView(deleteCategoryConfirmModal(action.value));
    render.setExternalId(action.value);
    render.setCallbackId(CategoryActionIds.DeleteCategoryCallback);
    const view = render.getView();
    try {
      await client.views.update({
        trigger_id: body.trigger_id,
        external_id: action.value,
        view,
      });
    } catch (error) {
      console.error(error);
    }
  });
};

export const deleteConfirmHandler = async (app: App) => {
  app.view(CategoryActionIds.DeleteCategoryCallback, async ({ ack, body, context, client }) => {
    await ack();
    body = body as ViewWorkflowStepSubmitAction;
    const action = body.view as any;
    const externalId = action.external_id;
    if (!externalId) {
      throw new Error("No value found");
    }
    if (!body.team) {
      throw new Error("No team found");
    }
    const categoryId = externalId;
    const categoryService = new CategoryService();
    console.log("Deleting category", categoryId);
    await categoryService.deleteCategory(categoryId);
    const homeView = await generateHomeView(body.team.id, "category");

    try {
      await client.views.publish({
        user_id: body.user.id,
        view: homeView,
      });
    } catch (error) {
      console.error(error);
    }
  });
};
