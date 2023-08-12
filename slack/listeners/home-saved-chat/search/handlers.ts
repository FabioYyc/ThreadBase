import { App, BlockAction, PlainTextInputAction } from "@slack/bolt";
import { searchButtonActionId, searchDispatchActionId, searchModalId } from "./constants";
import { createSearchModal, getThreadBlocks } from "./views";
import { threadRepo } from "../../../../modules/thread";

export const searchButtonHandler = (app : App) => {
    app.action(searchButtonActionId, async ({ ack, body, client }) => {
        await ack();
        const payload = body as BlockAction;
        const searchModalMaker = createSearchModal();
        const searchModal = searchModalMaker.getOriginal();
        try {
            await client.views.open({
                trigger_id: payload.trigger_id,
                view: searchModal
            });
        }
        catch (error) {
            console.error(JSON.stringify(error));
        }
    });
}

interface SearchViewUser {
    id: string;
    team_id: string;
  }
  
  interface SearchViewTeam {
    id: string;
    domain: string;
  }
  
  interface SearchViewAction {
    type: string;
    block_id: string;
    action_id: string;
    value: string;
    action_ts: string;
  }
  
  interface SearchViewIdentifiers {
    id: string;
    hash: string;
  }
  
  interface SearchViewBody {
    type: string;
    user: SearchViewUser;
    api_app_id: string;
    token: string;
    container: { type: string; view_id: string };
    trigger_id: string;
    team: SearchViewTeam;
    is_enterprise_install: boolean;
    view: SearchViewIdentifiers;
    actions: SearchViewAction[];
  }

export const searchModalHandler = (app : App) => {
    app.action(searchDispatchActionId, async ({ ack, body, client }) => {
        await ack();
        // use searchByTitle to get the results
        const payload: SearchViewBody = body as any;
        const userId = body.user.id;
        const orgId = body.user.team_id;
        const action = payload.actions[0] as PlainTextInputAction;
        const viewHash = payload.view.hash;
        const values = action.value;
        if(!orgId || !userId || !values) {
            throw new Error('Missing orgId, userId or values')
        }
        const results = await threadRepo.searchByText({orgId, userId, searchTerm: values});
        //update the modal view
        
        const threadBlocks = getThreadBlocks(results);

        const updatedModal = createSearchModal().appendBlocksAndViewUpdateBody(threadBlocks, payload.view.id, viewHash);

        client.views.update(updatedModal);

    });
}