import { KnownBlock } from "@slack/bolt";
import { addCategoryAction, getCategoryOptionBlock } from "../../../views/home/category.view";
import { Category } from "../../../types/Category";
import { AbstractHomeBlocks } from "./abstract-home-blocks-retriever";

export class CategoryBlockRetriever extends AbstractHomeBlocks {
  private getCurrentCategories(): Category[] {
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
  }

  private getCategoryBlocks(categories: Category[]): KnownBlock[] {
    const categoryBlocks: KnownBlock[] = categories.reduce((blocks, category, index) => {
      const currentCategoryBlock: KnownBlock = getCategoryOptionBlock(category);

      blocks.push(currentCategoryBlock);

      if (index !== categories.length - 1) {
        blocks.push({ type: "divider" });
      }

      return blocks;
    }, [] as KnownBlock[]);
    return [...categoryBlocks];
  }

  public getBlocks(): KnownBlock[] {
    const currentCategories = this.getCurrentCategories();
    const categoryBlocks = this.getCategoryBlocks(currentCategories);
    const categoryManagementBlocks = [...categoryBlocks, ...addCategoryAction];
    return categoryManagementBlocks;
  }
}
