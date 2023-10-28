import { KnownBlock, ModalView } from "@slack/bolt";
import { Category } from "../../../types/Category";
import { CategoryActionIds, CategoryFieldIds } from "../../../shared/constants/category.constants";

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

export const getCategoryText = (category: Category): string => {
  const defaultDescription = ":mag: No description found about this category";

  let text = `*${category.name}* \n ${category.description || defaultDescription}`;
  if (!category.linkedChannel) {
    text = text.concat(`\n :warning: this category is not linked to a channel`);
  }
  return text;
};

export const getCategoryOptionBlock = (category: Category): KnownBlock => {
  const { id } = category;
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: getCategoryText(category),
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Edit :pencil2:",
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

export const editOrCreateViewBlocks = (category?: Category): KnownBlock[] => {
  return [
    {
      type: "input",
      block_id: CategoryFieldIds.Name,
      element: {
        type: "plain_text_input",
        action_id: CategoryFieldIds.Name,
        initial_value: category?.name,
        placeholder: {
          type: "plain_text",
          text: "Name of the category",
          emoji: true,
        },
      },
      label: {
        type: "plain_text",
        text: "Category Name",
        emoji: true,
      },
      optional: false,
    },
    {
      type: "input",
      block_id: CategoryFieldIds.Description,
      element: {
        type: "plain_text_input",
        action_id: CategoryFieldIds.Description,
        multiline: true,
        initial_value: category?.description,
        placeholder: {
          type: "plain_text",
          text: "Description of the category",
          emoji: true,
        },
      },
      label: {
        type: "plain_text",
        text: "Description",
        emoji: true,
      },
      optional: true,
    },
    {
      type: "input",
      block_id: CategoryFieldIds.Channel,
      element: {
        type: "channels_select",
        action_id: CategoryFieldIds.Channel,
        initial_channel: category?.linkedChannel,
        placeholder: {
          type: "plain_text",
          text: "Link to a channel to enable posting in this category",
          emoji: true,
        },
      },
      label: {
        type: "plain_text",
        text: "Link to a channel",
        emoji: true,
      },
      optional: true,
    },
  ];
};
