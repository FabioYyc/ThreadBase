import { App } from "@slack/bolt";

const homeOpenListener = (app: App) => {
  app.event("app_home_opened", async ({ event, client, body }) => {
    console.log("app_home_opened", event, client, body);
  });
};

const registerHomeTabListeners = (app: App) => {
  homeOpenListener(app);
};

export const slackForumApp = (app: App) => {
  registerHomeTabListeners(app);
};
