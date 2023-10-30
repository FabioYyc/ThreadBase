import { View, KnownBlock } from "@slack/bolt";

abstract class ViewRender {
  protected view: View;

  constructor(view: View) {
    this.view = { ...view };
  }

  public updateBlocks(newBlocks: KnownBlock[]): void {
    this.view.blocks = [...newBlocks];
  }

  public appendBlocks(appendBlocks: KnownBlock[]): void {
    const blocks = [...this.view.blocks];
    const newBlocks = [...blocks.concat(appendBlocks)];
    this.updateBlocks(newBlocks as KnownBlock[]);
  }

  protected updateBlock(blockId: string, newBlock: KnownBlock): void {
    const blocks = [...this.view.blocks];
    const newBlocks = blocks.map((block) => {
      if (block.block_id === blockId) {
        return newBlock;
      }
      return block;
    });
    this.updateBlocks(newBlocks as KnownBlock[]);
  }

  public getView(): View {
    return this.view;
  }
}

export default ViewRender;
