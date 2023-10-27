import { KnownBlock } from "@slack/bolt";

export const addCategoryAction: KnownBlock[] = [
  {
    type: "divider",
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Add Category",
          emoji: true,
        },
        value: "add_category",
      },
    ],
  },
];

export const getCategoryOptionBlock = ({
  category,
  linkedChannel,
}: {
  category: string;
  linkedChannel?: string;
}): KnownBlock => {
  const linkChannelMessage = linkedChannel
    ? "this category is linked to the " + linkedChannel + " channel"
    : "this category is not linked to a channel";
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${category}* \n ${linkChannelMessage}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Edit",
        emoji: true,
      },
      action_id: "edit-category",
      value: category,
    },
  };
};
