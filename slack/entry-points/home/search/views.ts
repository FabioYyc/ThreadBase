import { ActionsBlock, Block, Button, KnownBlock, Option, View } from "@slack/bolt";
import {
  searchButtonActionId,
  searchConfluenceCheckedActionId,
  searchConfluenceLogoutActionId,
  searchConfluneceCheckBlockId,
  searchDispatchActionId,
  searchInputBlockId,
  searchModalId,
} from "./constants";
import { ISavedThread } from "../../../../common/models/thread";
import { joinUrls } from "../../../../common/utils/auth-url-utils";

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

export const createSearchModal = (initialConfig?: {
  [searchInputBlockId]?: string;
  [searchConfluneceCheckBlockId]?: Option[];
}) => {
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
        block_id: searchInputBlockId,
      },
      {
        type: "actions",
        block_id: searchConfluneceCheckBlockId,
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
    baseModal.blocks.forEach((block: any) => {
      if (!block.block_id) return;

      if (block.block_id === searchConfluneceCheckBlockId) {
        if (
          initialConfig[searchConfluneceCheckBlockId] &&
          initialConfig[searchConfluneceCheckBlockId].length > 0
        ) {
          block.elements[0].initial_options = initialConfig[searchConfluneceCheckBlockId];
        }
      }

      if (block.block_id === searchInputBlockId) {
        block.element.initial_value = initialConfig[searchInputBlockId];
      }
    });
  }
  console.log("baseModal", baseModal);
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

export const getThreadBlocks = (threads: ISavedThread[]): Block[] => {
  const emptyResultBlock = {
    type: "section",
    text: {
      type: "plain_text",
      text: "No chats match the search term :cry:",
      emoji: true,
    },
  };
  if (!threads.length) {
    return [emptyResultBlock];
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

export const getConfluencePageBlocks = (results: any[], siteUrl: string) => {
  const blocks: Block[] = [];
  results.forEach((result) => {
    const domain = siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`;
    if (!result.content._links) return;

    if (result.content?.type !== "page") return;

    const linkToPage = joinUrls(domain, "wiki", result.content._links.webui);
    const title = result.title.replace(/@@@hl@@@|@@@endhl@@@/g, "");
    const resultBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${title}* <${linkToPage}|:link:> \n `,
      },
    };

    blocks.push(resultBlock);
  });

  blocks.unshift(
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Results from Confluence:*",
      },
    } as Block,
  );

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
      text: `:information_source: _Close this modal and use the button again after you've linked your site._`,
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
    accessory: {
      type: "button",
      style: "primary",
      action_id: searchConfluenceLogoutActionId,
      text: {
        type: "plain_text",
        text: "Link Another Site",
        emoji: true,
      },
      value: siteUrl,
    },
    block_id: "confluence_site_url_display_block",
  },
];
