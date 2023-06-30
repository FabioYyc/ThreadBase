import { App, MessageShortcut } from "@slack/bolt"
import {ISavedThread, IThread, threadRepo} from "../../module/thread";
import  { confirmationMessage, createChatView, editChatCallbackId, saveChatCallbackId } from "./views";
import { viewInputReader } from "../../utils";
import { saveFromSaveChatView } from "./utils";
import { ButtonBlockAction } from "../../types";
import { getSavedThreadViewByUser } from "../home/home-tab-view";


export const editChatActionId = 'edit_saved_chat'

const saveShortcutHandler = (app: App) =>{
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
            });
            const returnView = createChatView({externalId:thread.id as string, isEdit: false})
            await client.views.open({
                trigger_id: messageShortcut.trigger_id,
                view: returnView
            })
        } catch (error) {
            console.error(`error in save chat: ${error}`)
        }

    })
}


const editChatHandler = (app: App) => {

    app.action(editChatActionId, async ({ ack, body, client }) => {
        await ack();
        const payload = body as any;
        const actions = (payload.actions as ButtonBlockAction[]);
        const threadId = actions[0].value;
        if(!threadId) {
            throw new Error('Missing thread id')
        }
        const thread = await threadRepo.getThreadById(threadId) as ISavedThread
        const returnView = createChatView({externalId: threadId, isEdit: true, thread})
        await client.views.open({
            trigger_id: payload.trigger_id,
            view: returnView
        })

    })
}


export const saveViewHandler = (app: App) => {
    return app.view(saveChatCallbackId, async ({ ack, body, view, client }) => {
      
        try {
            await ack();
            const thread = await saveFromSaveChatView(view);
            
            client.chat.postEphemeral({
                channel: thread.channelId,
                blocks: confirmationMessage(thread.userName),
                thread_ts: thread.threadId,
                user: thread.userId
            });

        } catch (error) {
            throw new Error(`error in save chat: ${error}`)
        }
    })
}

export const editConfirmHandler = (app: App) => {
    return app.view(editChatCallbackId, async ({ ack, body, view, client }) => {
      
        try {
            await ack();
            await saveFromSaveChatView(view);
            const userId = body.user.id;
            const returnView = await getSavedThreadViewByUser(userId);

            const result = await client.views.publish({
      
              /* the user that opened your app's app home */
              user_id: userId,
              /* the view object that appears in the app home*/
              view: returnView,
            });

        } catch (error) {
            throw new Error(`error in save chat: ${error}`)
        }
    })
}

export const registerSaveChatHandler = (app: App) => {

    saveShortcutHandler(app)
    saveViewHandler(app)
    editChatHandler(app)
    editConfirmHandler(app)
}