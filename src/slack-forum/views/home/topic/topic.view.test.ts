import { Topic } from "../../../types/Topic";
import { getTopicEntryBlock } from "./topic.view";

describe("topic view", () => {
  describe("getTopicEntryBlock", () => {
    it("should return a topic entry block", () => {
      const topic: Topic = {
        id: "123",
        name: "Test Topic",
        description: "This is a test topic",
      };

      const expectedBlock = {
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

      const result = getTopicEntryBlock(topic);

      expect(result).toEqual(expectedBlock);
    });
  });
});
