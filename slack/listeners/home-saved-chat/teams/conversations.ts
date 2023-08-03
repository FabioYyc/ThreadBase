import { App } from "@slack/bolt";
import { ITeamConversation } from "../../../module/team";

export const conversationMembers = async (app: App, conversationId: string) => {
    const res = await app.client.conversations.members({
        token: process.env.SLACK_BOT_TOKEN,
        channel: conversationId
    });

    if(!res.ok) {
        throw new Error(`error in getting conversation members: ${res.error}`)
    }

    return res.members;
}

export const createTeamConversations = async (app: App, conversationId:string): Promise<ITeamConversation> => {
    
    const members = await conversationMembers(app, conversationId);
    
    if(!members) {
        throw new Error(`error in getting conversation members: ${members}`)
    }

    return {
        conversationId,
        members
    }

}