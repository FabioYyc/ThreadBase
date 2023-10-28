import { View, KnownBlock } from "@slack/bolt";

abstract class ViewRender {
  protected view: View;

  constructor(view: View) {
    this.view = { ...view };
  }

  public updateBlock(newBlocks: KnownBlock[]): void {
    this.view.blocks = [...newBlocks];
  }

  public appendBlocks(appendBlocks: KnownBlock[]): void {
    const blocks = [...this.view.blocks];
    const newBlocks = [...blocks.concat(appendBlocks)];
    this.updateBlock(newBlocks as KnownBlock[]);
  }

  public getView(): View {
    return this.view;
  }
}

export default ViewRender;
