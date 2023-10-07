//registration of event listeners

import { App } from "@slack/bolt";
import { messageSentHandler } from "./message-sent/handlers";

export const registerEventListeners = (app: App) => {
  try {
    messageSentHandler(app);
  } catch (error) {
    console.error(error);
  }
};
