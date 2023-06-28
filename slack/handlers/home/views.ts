import { View } from "@slack/bolt";
import { ISavedThread, IThread } from "../../module/thread";

const homeViewBase: View = {
    type: "home",
    callback_id: "home_view",
    blocks: []}

export const noSavedThreadsView: View = {
    ...homeViewBase,
    ...{
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Looks like you haven't stashed any chats yet! 👆"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Use the *Save The Message* message shortcut to start organise chats with summaries, keywords, and descriptions. It's like a treasure map for your future self to find chats easily! 😎\nSimply hover over the message you want to save, click on the 'More actions' icon (it looks like three vertical dots), and choose 'Save The Chat'.`
                }
            }
        ]
    }
}

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
                    "value": thread._id.toString(),
                    "action_id": "edit_saved_thread"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": ":x: Delete"
                    },
                    "value": thread._id.toString(),
                    "action_id": "delete_saved_thread"
                },
            ]
        },
        {
            "type": "divider"
        }
    ]
}

const savedThreadsViews = (threads: ISavedThread[]) => {
    const blocks = []
    for (const thread of threads) {
        blocks.push(...savedThreadBlock(thread))
    }
    return blocks;
}

export const savedThreadExistsView = (Threads: ISavedThread[]): View => ({
    ...homeViewBase,
    ...{
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Here's your saved chats :speech_balloon:"
                }
            },
            {
                "type": "divider"
            },
            ...savedThreadsViews(Threads)
        ]
    }
})
        