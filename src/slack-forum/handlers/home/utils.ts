import { BlockRetrieverMap, HomeActions } from "../../shared/constants/home.constants";

export const getBlockRetriever = (key: HomeActions) => {
  const retrieverClass = BlockRetrieverMap[key].retrieverClass;
  return new retrieverClass();
};

export const getTitle = (key: HomeActions) => {
  // uppercase first letter add 's' to the end
  return key.charAt(0).toUpperCase() + key.slice(1) + "s";
};
