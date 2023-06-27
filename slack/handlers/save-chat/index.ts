import { App, MessageShortcut } from "@slack/bolt"
import {threadRepo} from "../../module/thread";
import saveChatView, { confirmationMessage } from "./views";
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
    
            if(!messageShortcut.team?.id || !messageShortcut.team?.domain || !messageShortcut.user.id || !messageShortcut.message_ts || !messageShortcut.user.name) {
                throw new Error('Missing required properties')
    
            }

            console.log('user is ', messageShortcut.user)
            //TODO: if thread already exist, update it
            const thread = await threadRepo.create({
                userId: messageShortcut.user.id,
                userName: messageShortcut.user.name,
                threadId: messageShortcut.message_ts,
                teamId: messageShortcut.team?.id,
                domain: messageShortcut.team?.domain,
                threadLink: threadPermalink.permalink as string,
                channelId: messageShortcut.channel.id,
                isSaved: false
            })
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
      
        try {
            await ack();
            const values = viewInputReader(view);
            const threadDetails = {
                title: stringParser(values.title),
                keywords: keywordsParser(values.keywords),
                description: stringParser(values.description)
            }

            if(!view.external_id) {
                throw new Error('Missing external id')
            }
            const thread = await threadRepo.addDetailFields(threadDetails, view.external_id)
            if(!thread) {
                throw new Error('Thread not found')
            }
            const returnTextBlocks = confirmationMessage
            client.chat.postEphemeral({
                channel: thread.channelId,
                blocks: returnTextBlocks(thread.userName),
                thread_ts: thread.threadId,
                user: thread.userId
            });

        } catch (error) {
            throw new Error(`error in save chat: ${error}`)
        }
    })
}

export const registerSaveChatHandler = (app: App) => {

    saveChatHandler(app)
    viewHandler(app)
}