import { Button, View } from "@slack/bolt";
import { searchButtonActionId, searchModalId } from "./constants";

export const searchButton: Button = {
    "type": "button",
    "text": {
        "type": "plain_text",
        "text": "Search :mag:",
        "emoji": true
    },
    "style": "primary",
    "action_id": searchButtonActionId
}

export const searchModal: View = {
    "type": "modal",
    callback_id: searchModalId,
    "close": {
        "type": "plain_text",
        "text": "Close",
        "emoji": true
    },
    "title": {
        "type": "plain_text",
        "text": "Search chats :telescope:",
        "emoji": true
    },
    "blocks": [
		{
			"dispatch_action": true,
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Search by title",
                    "emoji": true
                }
			},
			"label": {
				"type": "plain_text",
				"text": ":left_speech_bubble:",
				"emoji": true
			}
		}
    ]
}