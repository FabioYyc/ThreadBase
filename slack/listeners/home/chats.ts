import { View } from "@slack/bolt"
import { ISavedThread } from "../../module/thread"
import { editChatActionId } from "../save-chat-modal/handlers"
import { deleteChatActionId } from "./delete-chat"

const savedThreadBlock = (thread: ISavedThread): View['blocks'] => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `<${thread.threadLink}|*${thread.title}*> \n *${thread.keywords.join(', ')}* \n ${thread.description}`
            },
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": ":pencil: Edit"
                    },
                    "value": thread.id,
                    "action_id": editChatActionId
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": ":x: Delete"
                    },
                    "value": thread.id,
                    "action_id": deleteChatActionId
                },
            ]
        },
        {
            "type": "divider"
        }
    ]
}


export const savedThreadsViews = (threads: ISavedThread[]) => {
    const blocks = []
    for (const thread of threads) {
        blocks.push(...savedThreadBlock(thread))
    }
    return blocks;
}