import { View } from "@slack/bolt";
import { ISavedThread } from "../../../common/models/thread";
import { editChatActionId } from "../save-chat/handlers";
import { deleteChatActionId } from "./edit-and-delete-chat/handler";
import { previewButton } from "./preview/views";
import { chatOverflowAccesoryView } from "./edit-and-delete-chat/view";

const savedThreadBlock = (thread: ISavedThread): View["blocks"] => {
  //TODO: deal with the case where the thread is a note
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${thread.title}* <${thread.threadLink}|:link:> \n ${thread.description}`,
      },
      accessory: chatOverflowAccesoryView(thread.id),
    },
    {
      type: "actions",
      elements: [previewButton(thread.id)],
    },
    {
      type: "divider",
    },
  ];
};

export const savedThreadsViews = (threads: ISavedThread[]) => {
  const blocks = [];
  for (const thread of threads) {
    blocks.push(...savedThreadBlock(thread));
  }
  return blocks;
};
