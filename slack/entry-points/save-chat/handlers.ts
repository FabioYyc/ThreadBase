import { App, MessageShortcut } from "@slack/bolt";
import { ISavedThread, threadRepo } from "../../../common/models/thread";
import {
  confirmationMessage,
  createChatView,
  editChatCallbackId,
  saveChatCallbackId,
} from "./views";
import { saveFromSaveChatView } from "./utils";
import { ButtonBlockAction } from "../../types";
import { getThreadsTabViewByUser } from "../home/home-tab-view";

export const editChatActionId = "edit_saved_chat";

const saveShortcutHandler = (app: App) => {
  return app.shortcut("save-chat", async ({ shortcut, ack, client }) => {
    try {
      await ack();
      const messageShortcut = shortcut as MessageShortcut;
      const threadPermalink = await client.chat.getPermalink({
        channel: messageShortcut.channel.id,
        message_ts: messageShortcut.message_ts,
      });

      if (
        !messageShortcut.team?.id ||
        !messageShortcut.team?.domain ||
        !messageShortcut.user.id ||
        !messageShortcut.message_ts ||
        !messageShortcut.user.name
      ) {
        throw new Error("Missing required properties");
      }
      const senderId = messageShortcut.message.user;

      //TODO: if thread already exist, update it
      const thread = await threadRepo.create({
        userId: messageShortcut.user.id,
        userName: messageShortcut.user.name,
        messageTs: messageShortcut.message_ts,
        orgId: messageShortcut.team?.id,
        domain: messageShortcut.team?.domain,
        threadLink: threadPermalink.permalink as string,
        channelId: messageShortcut.channel.id,
        isSaved: false,
        isReply: messageShortcut.message.parent_user_id ? true : false,
        senderId,
        isNote: false,
      });
      const returnView = await createChatView({
        externalId: thread.id as string,
        isEdit: false,
        userId: messageShortcut.user.id,
        orgId: messageShortcut.team?.id,
      });

      await client.views.open({
        trigger_id: messageShortcut.trigger_id,
        view: returnView,
      });
    } catch (error) {
      console.error(`error in save chat: ${error}`);
    }
  });
};

const editChatHandler = (app: App) => {
  app.action(editChatActionId, async ({ ack, body, client }) => {
    await ack();
    const payload = body as any;
    const actions = payload.actions as ButtonBlockAction[];
    const threadId = actions[0].value;
    if (!threadId) {
      throw new Error("Missing thread id");
    }
    const thread = (await threadRepo.getThreadById(threadId)) as ISavedThread;
    const orgId = thread.orgId;

    const returnView = await createChatView({
      orgId,
      externalId: threadId,
      isEdit: true,
      thread,
      userId: thread.userId,
    });
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: returnView,
    });
  });
};

export const saveViewHandler = (app: App) => {
  return app.view(saveChatCallbackId, async ({ ack, view, client }) => {
    try {
      await ack();
      await saveFromSaveChatView(view);
    } catch (error) {
      throw new Error(`error in save chat: ${error}`);
    }
  });
};

export const editConfirmHandler = (app: App) => {
  return app.view(editChatCallbackId, async ({ ack, body, view, client }) => {
    try {
      await ack();
      await saveFromSaveChatView(view);
      const userId = body.user.id;
      const orgId = view.team_id;
      const returnView = await getThreadsTabViewByUser(orgId, userId);

      const result = await client.views.publish({
        /* the user that opened your app's app home */
        user_id: userId,
        /* the view object that appears in the app home*/
        view: returnView,
      });
    } catch (error) {
      throw new Error(`error in save chat: ${error}`);
    }
  });
};

export const registerSaveChatHandler = (app: App) => {
  saveShortcutHandler(app);
  saveViewHandler(app);
  editChatHandler(app);
  editConfirmHandler(app);
};
