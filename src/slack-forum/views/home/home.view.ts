import { HomeView, KnownBlock } from "@slack/bolt";

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
  ],
};
