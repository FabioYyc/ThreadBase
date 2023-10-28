import { Category } from "../../types/Category";
import { CategoryModel } from "./category.model";

export class CategoryService {
  async createCategory(category: Category): Promise<Category> {
    const newCategory = new CategoryModel(category);
    return await newCategory.save();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await CategoryModel.findById(id).exec();
  }

  async getAllCategories(): Promise<Category[]> {
    return await CategoryModel.find().exec();
  }

  async updateCategory(id: string, category: Category): Promise<Category | null> {
    return await CategoryModel.findByIdAndUpdate(id, category, { new: true }).exec();
  }

  async deleteCategory(id: string): Promise<Category | null> {
    return await CategoryModel.findByIdAndDelete(id).exec();
  }
}
