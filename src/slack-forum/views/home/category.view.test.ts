import { CategoryActionIds } from "../../shared/constants/category.constants";
import { Category } from "../../types/Category";
import { getCategoryOptionBlock, getChannelMessage } from "./category.view";

describe("CategoryView", () => {
  describe("get channelMessage", () => {
    it("should return an empty string if linkedChannel is undefined", () => {
      const category: Category = {
        name: "name",
        id: "id",
      };
      const result = getChannelMessage(category.linkedChannel);
      expect(result).toBe("this category is not linked to a channel");
    });

    it("should return a string with the linkedChannel if it is defined", () => {
      const category: Category = {
        name: "name",
        id: "id",
        linkedChannel: [
          {
            name: "channelName",
            id: "channelId",
          },
          {
            name: "channelName2",
            id: "channelId2",
          },
        ],
      };
      const result = getChannelMessage(category.linkedChannel);
      expect(result).toBe(
        `this category is linked to the following channels: channelName, channelName2`,
      );
    });
  });
  describe("getCategoryOptionBlock", () => {
    it("should return a block with the category name and the channel message", () => {
      const category: Category = {
        name: "name",
        id: "id",
      };
      const result = getCategoryOptionBlock(category);
      expect(result).toEqual({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${category.name}* \n ${getChannelMessage(category.linkedChannel)}`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Edit",
            emoji: true,
          },
          action_id: CategoryActionIds.EditCategory,
          value: category.id,
        },
      });
    });
  });
});
