import { Category } from "../../types/Category";
import { CategoryModel } from "./category.model";

export class CategoryService {
  async createCategory(category: Category, orgId: string): Promise<Category> {
    const newCategory = new CategoryModel({ ...category, orgId });
    return await newCategory.save();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await CategoryModel.findById(id).exec();
  }

  async getAllCategories(orgId: string): Promise<Category[]> {
    return await CategoryModel.find().exec();
  }

  async updateCategory(id: string, category: Category): Promise<Category | null> {
    return await CategoryModel.findByIdAndUpdate(id, category, { new: true }).exec();
  }

  async deleteCategory(id: string): Promise<Category | null> {
    return await CategoryModel.findByIdAndDelete(id).exec();
  }
}
