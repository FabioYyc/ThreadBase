import { SectionBlock } from "@slack/bolt";
import { linkToGuide } from "./constants";

export const reminderMessage: SectionBlock[] = [
  {
    type: "section",
    block_id: "sectionBlockThreadNudge",
    text: {
      type: "mrkdwn",
      text: ":bell: Hey team! This thread is getting pretty long. If it contains valuable insights or knowledge, consider capturing it in Confluence or creating a Jira ticket.",
    },
  },
  {
    type: "section",
    block_id: "sectionBlockGuideInfo",
    text: {
      type: "mrkdwn",
      text: `:book: Need help? *Follow our <${linkToGuide}|guide>* to easily create entries in Jira or Confluence.`,
    },
  },
];
