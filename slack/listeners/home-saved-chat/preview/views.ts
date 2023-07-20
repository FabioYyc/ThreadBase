import { Button, View } from "@slack/bolt";
import { previewButtonActionId } from "./constants";

export const previewButton = (threadId: string): Button => ({
    "type": "button",
    "text": {
        "type": "plain_text",
        "text": ":eyes: Preview",
        "emoji": true
    },
    "action_id": previewButtonActionId,
    "value": threadId,
})

export const createPreviewModal = (message: any) => {
    const text = message.text;
    if (!text) {
        throw new Error("Invalid message");
    }

    const previewModal = {
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Preview",
            "emoji": true
        },
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": text
                }
            }
        ],
    }
    return previewModal as View;
}