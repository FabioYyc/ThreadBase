import { App } from "@slack/bolt";
import { ISavedThread, threadRepo } from "../../../../common/modules/thread";

export const getMessages = async ({ threadId, app }: { threadId: string, app: App }) => {

    const thread = await threadRepo.getThreadById(threadId) as ISavedThread
    const { channelId, messageTs, senderId, isReply } = thread;

    const messages = []
    
    let result;

    if (!isReply) {
        result = await app.client.conversations.history({
            token: process.env.SLACK_BOT_TOKEN,
            channel: channelId,
            latest: messageTs,
            limit: 1,
            user: senderId,
            inclusive: true,
        });

        if (result.messages && result.messages[0]) {
            messages.push(result.messages[0])
        }
    }
    else {
        result = await app.client.conversations.replies({
            token: process.env.SLACK_BOT_TOKEN,
            channel: channelId,
            ts: messageTs,
            limit: 1,
            user: senderId,
            inclusive: true,
        });
    }
    if (result.messages && result.messages[0]) {
        messages.push(result.messages[0])
    }
    return messages;

}