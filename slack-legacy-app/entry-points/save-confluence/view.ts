import { KnownBlock, ModalView, PlainTextOption, SectionBlock, View } from "@slack/bolt";
import {
  IPage,
  saveConfluenceLogoutActionId,
  pageContentBlockId,
  pageTitleBlockId,
  parentPageBlockId,
  saveConfluenceCallbackId,
} from "./constants";
import { formatPageValue } from "./utils";

export const authButtonLinkBlock = (
  authorizeUrl: string,
  confluenceSiteUrl: string,
): SectionBlock[] => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Link your account with Confluence site \n ${confluenceSiteUrl}`,
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
};

export const SaveConfluenceViews = () => {
  const authModal = (authorizeUrl: string): View => ({
    type: "modal",
    title: {
      type: "plain_text",
      text: "Confluence Integration",
      emoji: true,
    },
    blocks: [
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
          text: `:information_source: _Close this modal and use the shortcut again after you've linked your site._`,
        },
      },
    ],
  });

  const saveToConfluencePageModal = ({
    confluenceSiteUrl,
    pages,
    messageLink,
    sessionId,
  }: {
    confluenceSiteUrl?: string;
    pages: IPage[];
    messageLink?: string;
    sessionId: string;
  }): ModalView => {
    const options: PlainTextOption[] = pages.map((page) => {
      return {
        text: {
          type: "plain_text",
          text: page.title,
          emoji: true,
        },
        value: formatPageValue(page),
      };
    });
    return {
      type: "modal",
      callback_id: saveConfluenceCallbackId,
      external_id: sessionId,
      private_metadata: confluenceSiteUrl,
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true,
      },
      title: {
        type: "plain_text",
        text: "Save to Confluence",
        emoji: true,
      },
      blocks: [
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Confluence Site* \n ${confluenceSiteUrl}`,
            },
          ],
          accessory: {
            type: "button",
            style: "primary",
            action_id: saveConfluenceLogoutActionId,
            text: {
              type: "plain_text",
              text: "Link Another Site",
              emoji: true,
            },
          },
        },
        {
          type: "input",
          block_id: parentPageBlockId,
          element: {
            type: "static_select",
            placeholder: {
              type: "plain_text",
              text: "Select the parent page for the new page",
              emoji: true,
            },
            options: options,
            action_id: "static_select-action",
          },
          label: {
            type: "plain_text",
            text: "Select Parent Page",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: pageTitleBlockId,
          element: {
            type: "plain_text_input",
          },
          label: {
            type: "plain_text",
            text: "Page Title",
            emoji: true,
          },
        },
        {
          type: "input",
          block_id: pageContentBlockId,
          element: {
            type: "plain_text_input",
            multiline: true,
            initial_value: messageLink,
          },
          label: {
            type: "plain_text",
            text: "Page Content",
            emoji: true,
          },
        },
      ],
    };
  };

  const successMessage = (pageUrl: string, title: string): KnownBlock[] => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Success! A new Confluence Page titled "${title}" has been created. Click <${pageUrl}|here> to view it. :tada:`,
      },
    },
  ];

  return {
    authModal,
    saveToConfluencePageModal,
    successMessage,
  };
};
