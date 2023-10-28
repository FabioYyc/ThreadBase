import { App } from "@slack/bolt";
import { registerHomeTabListeners } from "./handlers/home/home.handler";

export const slackForumApp = (app: App) => {
  registerHomeTabListeners(app);
};
