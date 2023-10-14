import { KnownBlock, ModalView } from "@slack/bolt";

export interface ModalBuilder {
  build: () => ModalView;
  addBlock: (newBlocks: KnownBlock[]) => void;
}
