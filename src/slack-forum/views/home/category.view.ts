import { KnownBlock, ModalView } from "@slack/bolt";
import { Category } from "../../types/Category";

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

export const getCategoryOptionBlock = (category: Category): KnownBlock => {
  const { linkedChannel, name, id } = category;
  const linkChannelMessage = linkedChannel
    ? "this category is linked to the " + linkedChannel + " channel"
    : "this category is not linked to a channel";
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${name}* \n ${linkChannelMessage}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Edit",
        emoji: true,
      },
      action_id: "edit-category",
      value: id,
    },
  };
};

export const editModalView = (category: {
  name: string;
  id: string;
  linkedChannel?: string;
}): ModalView => {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Edit Category",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
      emoji: true,
    },
    blocks: [
      {
        type: "input",
        block_id: "category_name",
        element: {
          type: "plain_text_input",
          action_id: "category_name",
          initial_value: category.name,
        },
        label: {
          type: "plain_text",
          text: "Category Name",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "channel",
        element: {
          type: "channels_select",
          action_id: "channel",
          initial_channel: category.linkedChannel,
        },
        label: {
          type: "plain_text",
          text: "Channel",
          emoji: true,
        },
      },
    ],
  };
};
