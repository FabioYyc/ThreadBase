import { View } from "@slack/bolt"
import { ISavedThread } from "../../../modules/thread"
import { editChatActionId } from "../save-chat/handlers"
import { deleteChatActionId } from "./edit-and-delete-chat/handler"
import { previewButton } from "./preview/views"
import { chatOverflowAccesoryView } from "./edit-and-delete-chat/view"

const savedThreadBlock = (thread: ISavedThread): View['blocks'] => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${thread.title}* <${thread.threadLink}|:link:> \n ${thread.description}`,
            },
            accessory: chatOverflowAccesoryView(thread.id)
        },
        {
            "type": "actions",
            "elements": [
                // {
                //     "type": "button",
                //     "text": {
                //         "type": "plain_text",
                //         "emoji": true,
                //         "text": ":pencil: Edit"
                //     },
                //     "value": thread.id,
                //     "action_id": editChatActionId
                // },
                // {
                //     "type": "button",
                //     "text": {
                //         "type": "plain_text",
                //         "emoji": true,
                //         "text": ":x: Delete"
                //     },
                //     "value": thread.id,
                //     "action_id": deleteChatActionId
                // },
                previewButton(thread.id)
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