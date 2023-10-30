import { ActionsBlock, Button, HeaderBlock, SectionBlock, View } from "@slack/bolt";
import ViewRender from "./abstract-view-render";
import { HomeActionBlockId, HomeActionTitleBlockId } from "../constants/home.constants";

class HomeTabViewRender extends ViewRender {
  constructor(view: View) {
    super(view);
  }
  public updateActionTitleBlock(actionName: string): void {
    const newBlock: HeaderBlock = {
      type: "header",
      block_id: HomeActionTitleBlockId,
      text: {
        type: "plain_text",
        text: `${actionName}`,
      },
    };
    this.updateBlock(HomeActionTitleBlockId, newBlock);
  }
}

export default HomeTabViewRender;
