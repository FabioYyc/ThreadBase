import { KnownBlock, ModalView } from "@slack/bolt";
import { CategoryActionIds } from "../../../shared/constants/category.constants";

export const deleteCategoryBlocks = (categoryId: string): KnownBlock[] => {
  return [
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
            text: "Delete this category",
            emoji: true,
          },
          value: categoryId,
          action_id: CategoryActionIds.DeleteCategoryAction,
          style: "danger",
        },
      ],
    },
  ];
};

export const deleteCategoryConfirmModal = (categoryId: string): ModalView => ({
  type: "modal",
  title: {
    type: "plain_text",
    text: "Delete Category",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: ":warning: Confirm Delete",
    emoji: true,
  },
  private_metadata: categoryId,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Are you sure you want to delete this category?* \n This action cannot be undone. All the posts in this category will be deleted as well.",
      },
    },
  ],
});
