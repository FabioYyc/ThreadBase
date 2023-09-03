import { App, BlockAction, PlainTextInputAction } from "@slack/bolt";
import { searchButtonActionId, searchDispatchActionId } from "./constants";
import { createSearchModal, getThreadBlocks } from "./views";
import { threadRepo } from "../../../../common/models/thread";
import { getTeamsForUser } from "../teams/utils";

export const searchButtonHandler = (app: App) => {
  app.action(searchButtonActionId, async ({ ack, body, client }) => {
    await ack();
    const payload = body as BlockAction;
    const searchModalMaker = createSearchModal();
    const searchModal = searchModalMaker.getSearchInput();
    try {
      await client.views.open({
        trigger_id: payload.trigger_id,
        view: searchModal,
      });
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  });
};

export const searchModalHandler = (app: App) => {
  app.action(searchDispatchActionId, async ({ ack, body, client }) => {
    await ack();
    // use searchByTitle to get the results
    const payload = body as BlockAction;
    const userId = payload.user.id;
    const orgId = payload.team?.id;
    const viewHash = payload.view?.hash;
    const viewId = payload.view?.id;
    const action = payload.actions[0] as PlainTextInputAction;
    const values = action.value;

    if (!orgId || !userId || !values || !viewHash || !viewId) {
      throw new Error("Missing orgId, userId, value or viewHash");
    }
    const teams = await getTeamsForUser(orgId, userId);
    const teamIds = teams.map((team) => team.id);
    const results = await threadRepo.searchByText({ orgId, userId, teamIds, searchTerm: values });
    //update the modal view

    const threadBlocks = getThreadBlocks(results);

    const updatedModal = createSearchModal().appendBlocksAndViewUpdateBody(
      threadBlocks,
      viewId,
      viewHash,
    );

    client.views.update(updatedModal);
  });
};
