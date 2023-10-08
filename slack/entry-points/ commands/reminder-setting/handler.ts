import { App } from "@slack/bolt";
import { reminderCommandName } from "./constant";

export const configReminderHandler = async (app: App) => {
  app.command(reminderCommandName, async ({ command, ack, say }) => {
    await ack();
    console.log("command", command);
    await say("Hello");
  });
};
