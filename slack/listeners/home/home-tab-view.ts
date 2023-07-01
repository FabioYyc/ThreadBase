import { View } from "@slack/bolt";
import { ISavedThread, IThread, threadRepo } from "../../module/thread";
import { deleteChatActionId } from "./delete-chat";
import { editChatActionId } from "../save-chat/handlers";
import { homeTabActionRow, teamSelector } from "./teams/views";
import { savedThreadsViews } from "./chats";

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
            homeTabActionRow(),
            teamSelector(),
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
            homeTabActionRow(),
            {
                "type": "divider"
            },
            ...savedThreadsViews(Threads)
        ]
    }
})
  

export const getSavedThreadViewByUser = async (userId:string) =>{
    const Threads = await threadRepo.getSavedThreadForUser(userId);
    if (Threads.length > 0) {
        return savedThreadExistsView(Threads);
    }
    return noSavedThreadsView;
}