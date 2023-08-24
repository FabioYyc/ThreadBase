import { App, BlockAction, ButtonAction } from "@slack/bolt";
import { previewButtonActionId } from "./constants";
import { createPreviewModal } from "./views";
import { getMessagesFormThread } from "./utils";

export const previewButtonHandler = (app : App) => {
    app.action(previewButtonActionId, async ({ ack, body, client }) => {
        await ack();
        const payload = body as BlockAction;
        const action = payload.actions[0] as ButtonAction;
        const threadId = action.value;
        const messages = await getMessagesFormThread({ threadId, app });
        if(!messages.length) {
            throw new Error("Invalid number of messages");
        }
        const message = messages[0];
    
        const previewModal = createPreviewModal(message);

        try {
            await client.views.open({
                trigger_id: payload.trigger_id,
                view: previewModal
            });
        }
        catch (error) {
            console.error(JSON.stringify(error));
        } 
    });
}
