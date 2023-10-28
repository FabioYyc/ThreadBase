import mongoose from "mongoose";

export type CategoryDocument = mongoose.Document & {
  name: string;
  id: string;
  linkedChannel?: string;
  description?: string;
};

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  linkedChannel: { type: String },
  description: { type: String },
});

export const CategoryModel = mongoose.model<CategoryDocument>("Category", categorySchema);
