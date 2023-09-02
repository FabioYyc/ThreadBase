import { Overflow, View } from "@slack/bolt";
import { editChatOverflowValue, deleteChatOverflowValue } from "./utils";

export const deleteChatActionId = "delete_saved_thread";
export const deleteChatConfirmViewId = "delete-chat-view";
export const overflowActionId = "edit-and-delete-action";

export const deleteChatConfirmView = (external_id: string): View => ({
  type: "modal",
  callback_id: deleteChatConfirmViewId,
  external_id,
  submit: {
    type: "plain_text",
    text: "Confirm",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  title: {
    type: "plain_text",
    text: "Delete this chat :broom:",
    emoji: true,
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Confirm you want to DELETE this entry from your saved chat",
        emoji: true,
      },
    },
  ],
});

export const chatOverflowAccesoryView = (threadId: string): Overflow => ({
  type: "overflow",
  action_id: overflowActionId,
  options: [
    {
      text: {
        type: "plain_text",
        text: "Edit :pencil2:",
        emoji: true,
      },
      value: editChatOverflowValue(threadId),
    },
    {
      text: {
        type: "plain_text",
        text: "Delete :x:",
        emoji: true,
      },
      value: deleteChatOverflowValue(threadId),
    },
  ],
});
