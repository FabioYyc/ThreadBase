import { App, MessageShortcut } from "@slack/bolt"
import {threadRepo} from "../../module/thread";
import saveChatView from "./views";
import { viewInputReader } from "../../utils";




const saveChatHandler = (app: App) =>{
    return app.shortcut('save-chat', async ({ shortcut, ack, client }) => {
        try {
            await ack();
            const messageShortcut = shortcut as MessageShortcut
            const threadPermalink = await client.chat.getPermalink({
                channel: messageShortcut.channel.id,
                message_ts: messageShortcut.message_ts
            })
    
            if(!messageShortcut.team?.id || !messageShortcut.team?.domain || !messageShortcut.user.id || !messageShortcut.message_ts) {
                throw new Error('Missing required properties')
    
            }
            const thread = await threadRepo.create({
                userId: messageShortcut.user.id,
                threadId: messageShortcut.message_ts,
                teamId: messageShortcut.team?.id,
                domain: messageShortcut.team?.domain,
                threadLink: threadPermalink.permalink as string,
                isSaved: false
            })
            const returnTextBlocks = [{"type": "section", "text": {"type": "mrkdwn", "text": `Saved to your knowledge base with [link](${threadPermalink.permalink}) :tada:`}}]
            // client.chat.postEphemeral({
            //     channel: messageShortcut.channel.id,
            //     blocks: returnTextBlocks,
            //     thread_ts: messageShortcut.message_ts,
            //     user: messageShortcut.user.id
            // });
            
            const returnView = saveChatView(thread.id)
            await client.views.open({
                trigger_id: messageShortcut.trigger_id,
                view: returnView
            })
        } catch (error) {
            console.error(`error in save chat: ${error}`)
        }

    })
}

export const keywordsParser = (keywords: string|null|undefined) => {
    if(!keywords) {
        return []
    }
    return keywords.split(',')
}

export const stringParser = (string: string|null|undefined) => {
    if(!string) {
        return ''
    }
    // replace all "+" with space
    return string.replace(/\+/g, ' ')

}

export const viewHandler = (app: App) => {
    return app.view('save-chat-view', async ({ ack, body, view, client }) => {
        await ack();
        try {
            const values = viewInputReader(view);
            const threadDetails = {
                title: stringParser(values.title),
                keywords: keywordsParser(values.keywords),
                description: stringParser(values.description)
            }

            if(!view.external_id) {
                throw new Error('Missing external id')
            }
            await threadRepo.addDetailFields(threadDetails, view.external_id)

            console.log('updated saved thread')

            
        } catch (error) {
            throw new Error(`error in save chat: ${error}`)
        }
    })
}

export const registerSaveChatHandler = (app: App) => {

    saveChatHandler(app)
    viewHandler(app)
}