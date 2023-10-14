import { App, BlockAction, OverflowAction } from "@slack/bolt";
import { ButtonBlockAction } from "../../../types";
import { ISavedThread, threadRepo } from "../../../../common/models/thread";
import { getUserHomeView } from "../home-tab-view";
import { createChatView } from "../../shortcuts/save-chat/views";
import { deleteChatConfirmView, overflowActionId } from "./view";
import { ChatActions } from "./utils";

export const deleteChatActionId = "delete_saved_thread";
export const deleteChatConfirmViewId = "delete-chat-view";

export const deleteChatConfirm = (app: App) => {
  app.action(deleteChatActionId, async ({ ack, body, client }) => {
    await ack();
    const payload = body as any;
    const actions = payload.actions as ButtonBlockAction[];
    const deleteAction = actions.find((action) => action.action_id === deleteChatActionId);
    if (!deleteAction) {
      throw new Error("Delete action not found");
    }
    await client.views.open({
      trigger_id: payload.trigger_id as string,
      view: deleteChatConfirmView(deleteAction.value),
    });
  });
};

export const deleteChatProcessor = (app: App) => {
  app.view(deleteChatConfirmViewId, async ({ ack, body, view, client }) => {
    try {
      await ack();
      const external_id = view.external_id;
      const orgId = view.team_id;
      if (!external_id) {
        throw new Error("Missing external id");
      }
      await threadRepo.deleteSavedThread(external_id);
      await getUserHomeView(orgId, body.user.id, client);
    } catch (error) {
      throw new Error(`error in delete chat: ${error}`);
    }
  });
};

const handleEditAction = async (threadId: string, payload: any, client: any) => {
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
};

const handleDeleteAction = async (threadId: string, payload: BlockAction, client: any) => {
  await client.views.open({
    trigger_id: payload.trigger_id as string,
    view: deleteChatConfirmView(threadId),
  });
};

export const overflowActionHandler = (app: App) => {
  app.action(overflowActionId, async ({ ack, body, client }) => {
    await ack();
    const payload = body as BlockAction;
    const actions = payload.actions as OverflowAction[];
    const overflowAction = actions.find((action) => action.action_id === overflowActionId);
    if (!overflowAction) {
      throw new Error("Overflow action not found");
    }
    const optionValue = overflowAction.selected_option.value;
    const [actionType, threadId] = optionValue.split("-");

    switch (actionType) {
      case ChatActions.EDIT:
        await handleEditAction(threadId, payload, client);
        break;
      case ChatActions.DELETE:
        await handleDeleteAction(threadId, payload, client);
        break;
      default:
        throw new Error("Unknown action type");
    }
  });
};

export const editAndDeleteHandlers = (app: App) => {
  deleteChatConfirm(app);
  deleteChatProcessor(app);
  overflowActionHandler(app);
};
