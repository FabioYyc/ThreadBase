import { CategoryBlockRetriever } from "./blocks-retrievers/category.retriever";

export const blockRetrieverMap = {
  category: CategoryBlockRetriever,
};

export const getBlockRetriever = (key: keyof typeof blockRetrieverMap) => {
  const retrieverClass = blockRetrieverMap[key];
  return new retrieverClass();
};
