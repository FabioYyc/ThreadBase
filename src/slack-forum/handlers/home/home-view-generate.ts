import { BlockRetrieverMap } from "../../shared/constants/home.constants";
import HomeTabViewRender from "../../shared/view-render/home-tab-view-render";
import { homeBaseView } from "../../views/home/home.view";
import { AbstractHomeBlocks } from "./blocks-retrievers/abstract-home-blocks-retriever";
import { getBlockRetriever, getTitle } from "./utils";
import { View } from "@slack/bolt";

export const generateHomeView = async (
  orgId: string,
  retrieverId: keyof typeof BlockRetrieverMap,
): Promise<View> => {
  const blockRetriever: AbstractHomeBlocks = getBlockRetriever(retrieverId);
  const render = new HomeTabViewRender(homeBaseView);
  const actionBlocks = await blockRetriever.getBlocks(orgId);
  render.updateActionTitleBlock(getTitle(retrieverId));
  render.appendBlocks([
    {
      type: "divider",
    },
  ]);
  render.appendBlocks(actionBlocks);
  const view = render.getView();

  return view;
};
