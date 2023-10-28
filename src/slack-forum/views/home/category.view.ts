import { KnownBlock, ModalView } from "@slack/bolt";
import { Category } from "../../types/Category";
import { CategoryActionIds, CategoryFieldIds } from "../../shared/constants/category.constants";

export const addCategoryAction: KnownBlock[] = [
  {
    type: "divider",
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        action_id: CategoryActionIds.AddCategory,
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

export const getChannelMessage = (linkedChannel: Category["linkedChannel"]): string => {
  if (!linkedChannel || linkedChannel.length === 0) {
    return "this category is not linked to a channel";
  }
  const channelNames = linkedChannel.map((channel) => channel.name);
  const channelMessage = `this category is linked to the following channels: ${channelNames.join(
    ", ",
  )}`;
  return channelMessage;
};

export const getCategoryOptionBlock = (category: Category): KnownBlock => {
  const { linkedChannel, name, id } = category;
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${name}* \n ${getChannelMessage(linkedChannel)}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Edit",
        emoji: true,
      },
      action_id: CategoryActionIds.EditCategory,
      value: id,
    },
  };
};

export const categoryBaseModalView: ModalView = {
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
  blocks: [],
};

export const editOrCreateViewBlocks = (category: {
  name?: string;
  id?: string;
  linkedChannelId?: string;
}): KnownBlock[] => {
  return [
    {
      type: "input",
      block_id: CategoryFieldIds.Name,
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
      block_id: CategoryFieldIds.Channel,
      element: {
        type: "channels_select",
        action_id: "channel",
        initial_channel: category.linkedChannelId,
      },
      label: {
        type: "plain_text",
        text: "Link to Channel",
        emoji: true,
      },
    },
  ];
};
