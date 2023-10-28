import { ModalView } from "@slack/bolt";
import ViewRender from "./abstract-view-render";

class SlackModalView extends ViewRender {
  protected view: ModalView;

  constructor(view: ModalView) {
    super(view);
    this.view = { ...view };
  }

  public setTitle(titleText: string): void {
    this.view.title.text = titleText;
  }
  public setCallbackId(callbackId: string): void {
    this.view.callback_id = callbackId;
  }
  public setExternalId(externalId: string): void {
    this.view.external_id = externalId;
  }
}

export default SlackModalView;
