import { Block, Button, KnownBlock, View } from "@slack/bolt";
import { searchButtonActionId, searchDispatchActionId, searchModalId } from "./constants";
import { ISavedThread } from "../../../../common/models/thread";

export const searchButton: Button = {
  type: "button",
  text: {
    type: "plain_text",
    text: "Search :mag:",
    emoji: true,
  },
  style: "primary",
  action_id: searchButtonActionId,
};

export const createSearchModal = () => {
  const baseModal: View = {
    type: "modal",
    callback_id: searchModalId,
    close: {
      type: "plain_text",
      text: "Close",
      emoji: true,
    },
    title: {
      type: "plain_text",
      text: "Search chats :telescope:",
      emoji: true,
    },
    blocks: [
      {
        dispatch_action: true,
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: searchDispatchActionId,
          placeholder: {
            type: "plain_text",
            text: "Search by title",
            emoji: true,
          },
        },
        label: {
          type: "plain_text",
          text: ":left_speech_bubble:",
          emoji: true,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "checkboxes",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Include Confluence Pages in Search",
                  emoji: true,
                },
                description: {
                  type: "plain_text",
                  text: "Enable this option to include results from Confluence pages in your search.",
                  emoji: true,
                },
                value: "value-0",
              },
            ],
          },
        ],
      },
    ],
  };
  return {
    getSearchInput: () => baseModal as View,
    appendBlocksAndViewUpdateBody: (additionalBlocks: Block[], viewId: string, hash: string) => {
      const newModal = { ...baseModal };
      newModal.blocks = [...newModal.blocks, ...additionalBlocks];
      return {
        view_id: viewId,
        hash: hash,
        view: newModal,
      };
    },
  };
};

export const getThreadBlocks = (threads: ISavedThread[]) => {
  if (!threads.length) {
    return [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "No chats match the search term :cry:",
          emoji: true,
        },
      },
    ];
  }

  const blocks: Block[] = threads.map((thread): KnownBlock => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${thread.title}* <${thread.threadLink}|:link:> \n ${thread.description}`,
      },
    };
  });
  blocks.unshift({
    type: "divider",
  });
  return blocks;
};
