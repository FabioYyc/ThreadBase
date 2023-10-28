import { CategoryBlockRetriever } from "./category.retriever";

jest.mock("../../../data-service/category/category.service", () => {
  return {
    CategoryService: jest.fn().mockImplementation(() => {
      return {
        getAllCategories: jest.fn().mockResolvedValue([
          { id: "1", name: "Test1", linkedChannel: "test-channel1" },
          { id: "2", name: "Test2", linkedChannel: "test-channel2" },
        ]),
      };
    }),
  };
});

describe("CategoryManager", () => {
  let blockRetriever: CategoryBlockRetriever;

  beforeEach(() => {
    blockRetriever = new CategoryBlockRetriever();

    jest
      .spyOn(blockRetriever as any, "getCategoryBlocks")
      .mockReturnValue([
        { type: "option_block", name: "Test1" },
        { type: "divider" },
        { type: "option_block", name: "Test2" },
      ]);
  });

  describe("getBlocks", () => {
    it("should return combined blocks of categories and the addCategoryAction", async () => {
      const blocks = await blockRetriever.getBlocks("test");

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
