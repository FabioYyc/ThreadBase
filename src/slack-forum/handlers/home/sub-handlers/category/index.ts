import { App } from "@slack/bolt";
import { registerCategoryCreateOrEditListeners } from "./category-edit-create.handler";

export const registerCategoryHandlers = (app: App) => {
  registerCategoryCreateOrEditListeners(app);
};
