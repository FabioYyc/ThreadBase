import { App, BlockAction } from "@slack/bolt";
import { CategoryActionIds } from "../../../../shared/constants/category.constants";
import { editModalView } from "../../../../views/home/category.view";

//action ids
export const editCategoryButtonHandler = async (app: App) => {
  app.action(CategoryActionIds.EditCategory, async ({ ack, body, context, client }) => {
    await ack();
    body = body as BlockAction;
    const testCategory = {
      name: "General",
      id: "1",
      linkedChannel: "general",
    };
    const modal = editModalView(testCategory);
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: modal,
      });
    } catch (error) {
      console.error(error);
    }
  });
};
