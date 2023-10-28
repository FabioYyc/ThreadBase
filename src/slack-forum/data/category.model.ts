import mongoose from "mongoose";

export type CategoryDocument = mongoose.Document & {
  name: string;
  id: string;
  linkedChannel?: string;
};

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  linkedChannel: { type: String },
});

export const Category = mongoose.model<CategoryDocument>("Category", categorySchema);
