import { App, BlockAction } from "@slack/bolt";
import { saveNoteActionId, saveNoteCallbackId } from "./constant";
import { createNoteView } from "./view";
import { saveFromSaveNoteView } from "./utils";

const saveNoteButtonHandler = (app: App) => {
  app.action(saveNoteActionId, async ({ ack, body, client }) => {
    await ack();
    if (!body.team) {
      throw new Error("Missing team id");
    }
    const userId = body.user.id;
    const orgId = body.team.id;

    const returnView = await createNoteView({
      orgId,
      userId,
      callbackIdOverride: saveNoteCallbackId,
    });
    const payload = body as BlockAction;
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: returnView,
    });
  });
};

const saveNoteViewHandler = async (app: App) => {
  return app.view(saveNoteCallbackId, async ({ ack, body, view }) => {
    try {
      await ack();
      const userId = body.user.id;
      const orgId = view.team_id;
      const userName = body.user.name;
      await saveFromSaveNoteView({
        view,
        orgId,
        userId,
        userName,
      });
    } catch (error) {
      console.error(error);
    }
  });
};

export const saveNoteHandlers = (app: App) => {
  saveNoteButtonHandler(app);
  saveNoteViewHandler(app);
};
