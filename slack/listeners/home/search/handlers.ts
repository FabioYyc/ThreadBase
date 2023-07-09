import { App, BlockAction } from "@slack/bolt";
import { searchButtonActionId } from "./constants";
import { searchModal } from "./views";

export const searchButtonHandler = (app : App) => {
    app.action(searchButtonActionId, async ({ ack, body, client }) => {
        await ack();
        const payload = body as BlockAction;
        try {
            await client.views.open({
                trigger_id: payload.trigger_id,
                view: searchModal
            });
        }
        catch (error) {
            console.error(JSON.stringify(error));
        }
    });
}