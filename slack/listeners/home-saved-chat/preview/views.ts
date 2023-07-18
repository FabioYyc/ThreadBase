import { Button } from "@slack/bolt";
import { previewButtonActionId } from "./constants";

export const previewButton = (threadId: string): Button =>( {
    "type": "button",
    "text": {
        "type": "plain_text",
        "text": ":eyes: Preview",
        "emoji": true
    },
    "action_id": previewButtonActionId,
    "value": threadId,
})
