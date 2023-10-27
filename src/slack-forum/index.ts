import { App } from "@slack/bolt";
import { homeTabHandler } from "./handlers/home/home.handler";

export const slackForumApp = (app: App) => {
  homeTabHandler(app);
};
