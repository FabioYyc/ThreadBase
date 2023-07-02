import { View } from "@slack/bolt";
import { ISavedThread, IThread, threadRepo } from "../../module/thread";
import { deleteChatActionId } from "./delete-chat";
import { editChatActionId } from "../save-chat/handlers";
import { homeTabActionRow, teamSelector } from "./teams/views";
import { savedThreadsViews } from "./chats";
import { ISavedTeam, getTeamsForUser, teamRepo } from "../../module/team";

import { WebClient } from "@slack/web-api"

const homeViewBase: View = {
    type: "home",
    callback_id: "home_view",
    blocks: []}





export const noSavedThreadsView = (teams: ISavedTeam[], selectedTeamId?: string):View => ({
    ...homeViewBase,
    ...{
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Looks like there is no chat saved in this space yet👆"
                }
            },
            homeTabActionRow(),
            teamSelector(teams, selectedTeamId),
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
})


export const savedThreadExistsView = (Threads: ISavedThread[], teams: ISavedTeam[], selectedTeamId?: string): View => ({
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
            teamSelector(teams, selectedTeamId),
            {
                "type": "divider"
            },
            ...savedThreadsViews(Threads)
        ]
    }
})
  

export const getSavedThreadViewByUser = async (userId:string, selectedTeamId?:string) =>{
    const teams = await getTeamsForUser(userId);
    let threads: ISavedThread[];
    if(!selectedTeamId) {
        threads = await threadRepo.getPersonalSavedThreadForUser(userId)
    } else {
        threads = await threadRepo.getSavedThreadForTeam(selectedTeamId)
    }


    if (threads.length > 0) {
        return savedThreadExistsView(threads, teams, selectedTeamId);
    }
    return noSavedThreadsView(teams, selectedTeamId);
}


export const getUserHomeView = async (userId: string, client: WebClient, selectedTeamId?: string) => {
    const updatedHomeView = await getSavedThreadViewByUser(userId, selectedTeamId);
    client.views.publish({
        user_id: userId,
        view: updatedHomeView,
    })
}