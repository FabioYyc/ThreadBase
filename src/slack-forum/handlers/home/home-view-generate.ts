import HomeTabViewRender from "../../shared/view-render/home-tab-view-render";
import { homeBaseView } from "../../views/home/home.view";
import { AbstractHomeBlocks } from "./blocks-retrievers/abstract-home-blocks-retriever";
import { blockRetrieverMap, getBlockRetriever } from "./utils";
import { View } from "@slack/bolt";

export const generateHomeView = async (
  orgId: string,
  retrieverId: keyof typeof blockRetrieverMap,
): Promise<View> => {
  const blockRetriever: AbstractHomeBlocks = getBlockRetriever(retrieverId);
  const render = new HomeTabViewRender(homeBaseView);
  const categoryBlocks = await blockRetriever.getBlocks(orgId);
  render.appendBlocks(categoryBlocks);

  const view = render.getView();

  return view;
};
