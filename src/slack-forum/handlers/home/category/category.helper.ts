import { KnownBlock } from "@slack/bolt";
import { addCategoryAction, getCategoryOptionBlock } from "../../../views/home/category.view";
import { Category } from "../../../types/Category";

const getCurrentCategories = () => {
  const currentCategories: Category[] = [
    {
      id: "1",
      name: "General",
      linkedChannel: "general",
    },
    {
      id: "2",
      name: "Engineering Q&A",
      linkedChannel: "engineering-questions",
    },
  ];
  return [...currentCategories];
};

const getCategoryBlocks = (categories: Category[]) => {
  const categoryBlocks: KnownBlock[] = categories.reduce(
    (blocks, category, index) => {
      const currentCategoryBlock: KnownBlock = getCategoryOptionBlock(category);

      // Add the current block to the accumulator
      blocks.push(currentCategoryBlock);

      // If it's not the last category, also add a divider
      if (index !== categories.length - 1) {
        blocks.push({ type: "divider" });
      }

      return blocks;
    },
    [] as KnownBlock[], // Initial accumulator value
  );
  return [...categoryBlocks];
};

export const getCategoryManagementBlocks = (): KnownBlock[] => {
  const currentCategories = getCurrentCategories();
  const categoryBlocks = getCategoryBlocks(currentCategories);
  const categoryManagementBlocks = [...categoryBlocks, ...addCategoryAction];
  return categoryManagementBlocks;
};
