import { App, MessageShortcut } from "@slack/bolt"
import {threadRepo} from "../module/thread";




const saveChatHandler = (app: App) =>{
    return app.shortcut('save-chat', async ({ shortcut, ack, client }) => {
        await ack();
        const messageShortcut = shortcut as MessageShortcut
        const threadPermalink = await client.chat.getPermalink({
            channel: messageShortcut.channel.id,
            message_ts: messageShortcut.message_ts
        })

        // if(!messageShortcut.team?.id || !messageShortcut.team?.domain || !messageShortcut.user.id || !messageShortcut.message_ts) {
        //     throw new Error('Missing required properties')

        // }
        // await threadRepo.create({
        //     userId: messageShortcut.user.id,
        //     threadId: messageShortcut.message_ts,
        //     teamId: messageShortcut.team?.id,
        //     domain: messageShortcut.team?.domain,
        //     threadLink: threadPermalink.permalink as string,
        //     title: ''
        // })
        const returnTextBlocks = [{"type": "section", "text": {"type": "mrkdwn", "text": `Saved to your knowledge base with [link](${threadPermalink.permalink}) :tada:`}}]
        client.chat.postEphemeral({
            channel: messageShortcut.channel.id,
            blocks: returnTextBlocks,
            thread_ts: messageShortcut.message_ts,
            user: messageShortcut.user.id
        });
        
    })
}

export const registerShortcuts = (app: App) => {

    saveChatHandler(app)
}