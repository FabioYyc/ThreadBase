import { View } from "@slack/bolt";

export const callId = 'save-chat-view'

const createView = (externalId: string): View => ({
        "type": "modal",
        callback_id: callId,
        external_id: externalId,
        "submit": {
            "type": "plain_text",
            "text": "Submit",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "title": {
            "type": "plain_text",
            "text": "Save this chat :memo:",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Add more info to this chat and you'll find it easily next time! :brain:",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                block_id: 'title',
                "label": {
                    "type": "plain_text",
                    "text": "What's this chat about? :thinking_face:",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": false,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Give a short summary of the chat",
                        "emoji": true
                    }
                }
            },
            {
                "type": "input",
                block_id: 'keywords',
                "label": {
                    "type": "plain_text",
                    "text": "Keywords",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": false,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Keywords separated by commas, for example: frontend, css",
                        "emoji": true
                    }
                }
            },
            {
                "type": "input",
                block_id: 'description',
                "label": {
                    "type": "plain_text",
                    "text": "Description",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "A few lines that describe the chat",
                        "emoji": true
                    }
                },
                "optional": true
            }
        ]
    })


export default createView;


export const returnTextBlocks = [{"type": "section", "text": {"type": "mrkdwn", "text": `Saved to your knowledge base :tada:`}}]