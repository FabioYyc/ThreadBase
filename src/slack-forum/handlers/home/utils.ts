import { CategoryBlockRetriever } from "./blocks-retrievers/category.retriever";

export const getBlockRetriever = () => {
  return new CategoryBlockRetriever();
};
