import { App } from "@slack/bolt";
import { registerCategoryCreateOrEditListeners } from "./category-edit-create.handler";
import { deleteButtonHandler, deleteConfirmHandler } from "./category-delete-handler";

export const registerCategoryHandlers = (app: App) => {
  registerCategoryCreateOrEditListeners(app);
  deleteButtonHandler(app);
  deleteConfirmHandler(app);
};
