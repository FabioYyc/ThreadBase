import { HomeView, KnownBlock } from "@slack/bolt";
import {
  HomeActionBlockId,
  HomeActionIds,
  HomeActionTitleBlockId,
} from "../../shared/constants/home.constants";

export const homeBaseView: HomeView = {
  type: "home",
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Here is what you can do with ThreadBase Forum:",
      },
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      block_id: HomeActionBlockId,
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Manage Categories",
            emoji: true,
          },
          style: "primary",
          value: "manage_categories",
          action_id: HomeActionIds.ManageCategoryActionId,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Manage Topics",
            emoji: true,
          },
          style: "primary",
          value: "manage_topics",
          action_id: HomeActionIds.ManageTopicActionId,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: "https://api.slack.com/img/blocks/bkb_template_images/placeholder.png",
          alt_text: "placeholder",
        },
      ],
    },
    {
      type: "section",
      block_id: HomeActionTitleBlockId,
      text: {
        type: "mrkdwn",
        text: "Manage Categories",
      },
    },
  ],
};
