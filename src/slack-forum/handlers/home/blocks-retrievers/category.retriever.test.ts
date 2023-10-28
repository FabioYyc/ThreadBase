import { CategoryBlockRetriever } from "./category.retriever";

describe("CategoryManager", () => {
  let blockRetriever: CategoryBlockRetriever;

  beforeEach(() => {
    blockRetriever = new CategoryBlockRetriever();
  });

  describe("getBlocks", () => {
    it("should return combined blocks of categories and the addCategoryAction", () => {
      // Mock the private methods
      jest.spyOn(blockRetriever as any, "getCurrentCategories").mockReturnValue([
        { id: "1", name: "Test1", linkedChannel: "test-channel1" },
        { id: "2", name: "Test2", linkedChannel: "test-channel2" },
      ]);

      jest
        .spyOn(blockRetriever as any, "getCategoryBlocks")
        .mockReturnValue([
          { type: "option_block", name: "Test1" },
          { type: "divider" },
          { type: "option_block", name: "Test2" },
        ]);

      const blocks = blockRetriever.getBlocks();
      // Check that the result includes our mocked blocks and the addCategoryAction block
      expect(blocks).toEqual([
        expect.objectContaining({ type: "option_block", name: "Test1" }),
        expect.objectContaining({ type: "divider" }),
        expect.objectContaining({ type: "option_block", name: "Test2" }),
        expect.objectContaining({ type: "divider" }),
        expect.objectContaining({ type: "actions", elements: expect.any(Array) }),
      ]);
    });
  });
});
