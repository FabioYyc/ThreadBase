//registration of event listeners

import { App } from "@slack/bolt";
import { messageSentHandler } from "./message-sent/handler";

export const registerEventListeners = (app: App) => {
  messageSentHandler(app);
};
