import { KnownBlock } from "@slack/bolt";
import { Topic } from "../../../types/Topic";

export const getTopicEntryBlock = (topic: Topic): KnownBlock => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${topic.name}*\n${topic.description}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Edit :pencil2:",
        emoji: true,
      },
      action_id: "edit_topic",
      value: topic.id,
    },
  };
};
