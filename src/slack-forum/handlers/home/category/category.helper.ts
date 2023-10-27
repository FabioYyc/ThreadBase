import { KnownBlock } from "@slack/bolt";
import { addCategoryAction, getCategoryOptionBlock } from "../../../views/home/category.view";

const getCurrentCategories = () => {
  const currentCategories = [
    {
      category: "General",
      linkedChannel: "general",
    },
    {
      category: "Engineering Q&A",
      linkedChannel: "engineering-questions",
    },
  ];
  return [...currentCategories];
};

const getCategoryBlocks = () => {
  const currentCategories = getCurrentCategories();
  const categoryBlocks: KnownBlock[] = currentCategories.reduce(
    (blocks, category, index) => {
      const currentCategoryBlock: KnownBlock = getCategoryOptionBlock({
        category: category.category,
        linkedChannel: category.linkedChannel,
      });

      // Add the current block to the accumulator
      blocks.push(currentCategoryBlock);

      // If it's not the last category, also add a divider
      if (index !== currentCategories.length - 1) {
        blocks.push({ type: "divider" });
      }

      return blocks;
    },
    [] as KnownBlock[], // Initial accumulator value
  );
  return [...categoryBlocks];
};

export const getCategoryManagementBlocks = (): KnownBlock[] => {
  const categoryBlocks = getCategoryBlocks();
  const categoryManagementBlocks = [...categoryBlocks, ...addCategoryAction];
  return categoryManagementBlocks;
};
