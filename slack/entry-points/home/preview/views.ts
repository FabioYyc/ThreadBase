import { Button, ModalView, View } from "@slack/bolt";
import { previewButtonActionId } from "./constants";
export const errorMessage = `Unable to preview message. Please make sure the ThreadBase is in the channel, and the message is not deleted.`;

export const previewButton = (threadId: string): Button => ({
  type: "button",
  text: {
    type: "plain_text",
    text: ":eyes: Preview",
    emoji: true,
  },
  action_id: previewButtonActionId,
  value: threadId,
});

export const createPreviewModal = (message: {text?:string}, status?: 'error') => {
  const text = message.text;


  const previewModal: ModalView = {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Preview",
      emoji: true,
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text || errorMessage,
        },
      },
    ],
  };
  const errorTitle = 'Error Previewing Message'
  if(status === 'error') {
    previewModal.blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:warning: ${errorTitle}`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text || errorMessage,
        },
      },
    ];
  }
  return previewModal as View;
};
