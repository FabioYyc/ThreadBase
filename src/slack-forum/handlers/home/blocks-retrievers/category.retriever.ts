import { KnownBlock } from "@slack/bolt";
import { addCategoryAction, getCategoryOptionBlock } from "../../../views/home/category.view";
import { Category } from "../../../types/Category";
import { AbstractHomeBlocks } from "./abstract-home-blocks-retriever";
import { CategoryService } from "../../../data-service/category/category.service";

export class CategoryBlockRetriever extends AbstractHomeBlocks {
  private dataService: CategoryService = new CategoryService();
  private async getCurrentCategories(orgId: string): Promise<Category[]> {
    const categories = await this.dataService.getAllCategories(orgId);
    const currentCategories: Category[] = [
      {
        id: "1",
        name: "General",
        linkedChannel: "test1",
        description: "General discussion for everything",
      },
      {
        id: "2",
        name: "Engineering Q&A",
      },
    ];
    return [...categories];
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

  public async getBlocks(orgId: string): Promise<KnownBlock[]> {
    const currentCategories = await this.getCurrentCategories(orgId);
    const categoryBlocks = this.getCategoryBlocks(currentCategories);
    const categoryManagementBlocks = [...categoryBlocks, ...addCategoryAction];
    return categoryManagementBlocks;
  }
}
