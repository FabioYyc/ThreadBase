import { ActionsBlock, Block, Button, KnownBlock, Option, View } from "@slack/bolt";
import {
  searchButtonActionId,
  searchConfluenceCheckedActionId,
  searchConfluneceBlockId,
  searchDispatchActionId,
  searchModalId,
} from "./constants";
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

export const searchConfluenceOption: Option = {
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
  value: "true",
};

export const createSearchModal = (initialConfig?: { [blockId: string]: any }) => {
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
        block_id: searchConfluneceBlockId,
        elements: [
          {
            type: "checkboxes",
            options: [searchConfluenceOption],
            action_id: searchConfluenceCheckedActionId,
          },
        ],
      },
    ],
  };

  // Apply initial_config if provided
  if (initialConfig) {
    baseModal.blocks.forEach((block: KnownBlock | Block | ActionsBlock) => {
      if (!block.block_id || !initialConfig[block.block_id]) return;

      // Ensure the block is of type "actions" and has checkboxes
      if (block.type === "actions") {
        const actionBlock = block as ActionsBlock;
        if (actionBlock.elements?.[0]?.type === "checkboxes") {
          // TypeScript should now know that this is a checkboxes element
          (actionBlock.elements[0] as any).initial_options = initialConfig[block.block_id];
        }
      }
    });
  }

  return {
    getSearchInput: () => baseModal as View,
    appendBlocksToBaseView: (additionalBlocks: Block[], viewId: string, hash: string) => {
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

export const confluenceAuthView = (authorizeUrl: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Link your account with Confluence site`,
    },
    accessory: {
      type: "button",
      style: "primary",
      text: {
        type: "plain_text",
        text: "Link Now",
        emoji: true,
      },
      value: "create_confluence",
      url: authorizeUrl,
      action_id: "authorize_confluence",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:information_source: _Close this window and use the shortcut again after you've linked your site._`,
    },
  },
];

export const confluenceSiteDisplay = (siteUrl: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:white_check_mark: Your Confluence site is linked: ${siteUrl}`,
    },
  },
];
