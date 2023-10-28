import mongoose from "mongoose";

export type CategoryDocument = mongoose.Document & {
  name: string;
  id: string;
  linkedChannel?: string;
  description?: string;
  orgId: string;
};

const categorySchema = new mongoose.Schema(
  {
    orgId: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    linkedChannel: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel = mongoose.model<CategoryDocument>("Category", categorySchema);
