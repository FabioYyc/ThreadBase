import { Block, Button, View } from "@slack/bolt";
import { searchButtonActionId, searchDispatchActionId, searchModalId } from "./constants";
import { ISavedThread } from "../../../module/thread";

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

export const createSearchModal = () => {
    const baseModal: View = {
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
                    "action_id": searchDispatchActionId,
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

    return {
        getOriginal: () => baseModal as View,
        appendBlocksAndViewUpdateBody: (additionalBlocks: Block[], viewId: string, hash: string) => {
            const newModal = {...baseModal};
            newModal.blocks = [...newModal.blocks, ...additionalBlocks];
            return {
                view_id: viewId,
                hash: hash,
                view: newModal
            }
        }
    }
}

export const getThreadBlocks = (threads: ISavedThread[]) => {

    if(!threads.length) {
        return [{
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "No chats match the search term :cry:",
                "emoji": true
            }
        }]
    }

    const blocks: Block[] = threads.map(thread => {
        return   {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${thread.title}* <${thread.threadLink}|:link:> \n ${thread.description}`,
                "emoji": true
            },
        }
    } )
    blocks.unshift({
        "type": "divider"
    })
    return blocks
}

