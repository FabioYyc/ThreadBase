import { View } from "@slack/bolt";
import ViewRender from "./abstract-view-render";

class HomeTabViewRender extends ViewRender {
  constructor(view: View) {
    super(view);
  }
}

export default HomeTabViewRender;
