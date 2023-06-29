import { App, View } from "@slack/bolt";
import { ButtonBlockAction } from "../../types";
import { threadRepo } from "../../module/thread";
import { getSavedThreadViewByUser } from "./views";

export const deleteChatActionId = 'delete_saved_thread';
export const deleteChatConfirmViewId = 'delete-chat-view';
const deleteChatConfirmView = (external_id: string): View => ({
	"type": "modal",
    "callback_id": deleteChatConfirmViewId,
    external_id,
	"submit": {
		"type": "plain_text",
		"text": "Confirm",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"title": {
		"type": "plain_text",
		"text": "Delete this chat :broom:",
		"emoji": true
	},
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": "Confirm you want to *delete* this entry from your saved chat",
				"emoji": true
			}
		}
	]
})

export const deleteChatConfirm = (app: App) => {
    app.action(deleteChatActionId, async ({ ack, body, client }) => {
        await ack();
        const payload = body as any;
        const actions = (payload.actions as ButtonBlockAction[]);
        const deleteAction = actions.find(action => action.action_id === deleteChatActionId);
        if(!deleteAction) {
            throw new Error('Delete action not found')
        }
        client.views.open({
            trigger_id: payload.trigger_id as string,
            view: deleteChatConfirmView(deleteAction.value),
        })
    })
}

export const deleteChatProcessor = (app: App) => {
    app.view(deleteChatConfirmViewId, async ({ ack, body, view, client }) => {
        try {
            await ack();
            const external_id = view.external_id;
            if(!external_id) {
                throw new Error('Missing external id')
            }
            await threadRepo.deleteSavedThread(external_id);
            const updatedHomeView = await getSavedThreadViewByUser(body.user.id);
            client.views.publish({
                user_id: body.user.id,
                view: updatedHomeView,
            })
        } catch (error) {
            throw new Error(`error in delete chat: ${error}`)
        }
    })
}