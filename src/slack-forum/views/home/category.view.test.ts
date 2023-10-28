import { CategoryActionIds } from "../../shared/constants/category.constants";
import { Category } from "../../types/Category";
import { getCategoryOptionBlock, getCategoryText } from "./category.view";

describe("CategoryView", () => {
  describe("get categoryText", () => {
    it("should return show warning if no empty string is undefined", () => {
      const category: Category = {
        name: "test-name",
        id: "id",
      };
      const result = getCategoryText(category);
      expect(result).toContain("No description found about this category");
      expect(result).toContain(category.name);
      expect(result).toContain("this category is not linked to a channel");
    });

    it("should not show warning with the linkedChannel if it is defined", () => {
      const category: Category = {
        name: "test-name",
        id: "id",
        linkedChannel: "channelId",
      };
      const result = getCategoryText(category);
      expect(result).toContain("No description found about this category");
      expect(result).toContain(category.name);
      expect(result).not.toContain("this category is not linked to a channel");
    });

    it("should show description", () => {
      const category: Category = {
        name: "test-name",
        id: "id",
        linkedChannel: "channelId",
        description: "test-description",
      };
      const result = getCategoryText(category);
      expect(result).toContain(category.description);
      expect(result).toContain(category.name);
    });
  });
  describe("getCategoryOptionBlock", () => {
    it("should return a block with the category name and the channel message, without description", () => {
      const category: Category = {
        name: "name",
        id: "id",
      };
      const result = getCategoryOptionBlock(category);
      expect(result).toEqual({
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
          value: category.id,
        },
      });
    });
  });
});
