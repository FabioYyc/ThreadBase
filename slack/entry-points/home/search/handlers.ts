import {
  Action,
  App,
  Block,
  BlockAction,
  CheckboxesAction,
  KnownBlock,
  PlainTextInputAction,
} from "@slack/bolt";
import {
  searchButtonActionId,
  searchConfluenceCheckedActionId,
  searchConfluneceBlockId,
  searchDispatchActionId,
} from "./constants";
import {
  confluenceAuthView,
  confluenceSiteDisplay,
  createSearchModal,
  getConfluencePageBlocks,
  getThreadBlocks,
  searchConfluenceOption,
} from "./views";
import { threadRepo } from "../../../../common/models/thread";
import { getTeamsForUser } from "../teams/utils";
import { getUserConfluenceAuth } from "../../../shared/confluence/utils";
import { getAuthorizeUrl } from "../../../../common/utils/auth-url-utils";
import { getUserConfluenceAccessToken } from "./utils";
import { searchWithText } from "./apis";

const searchButtonHandler = (app: App) => {
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

const searchModalHandler = async (app: App) => {
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
    const confluenceEnabledCheckbox =
      payload.view?.state.values[searchConfluneceBlockId][searchConfluenceCheckedActionId]
        .selected_options;
    const confluenceEnabled = confluenceEnabledCheckbox && confluenceEnabledCheckbox.length > 0;

    if (!orgId || !userId || !values || !viewHash || !viewId) {
      throw new Error("Missing orgId, userId, value or viewHash");
    }
    const teams = await getTeamsForUser(orgId, userId);
    const teamIds = teams.map((team) => team.id);
    const threadResults = await threadRepo.searchByText({
      orgId,
      userId,
      teamIds,
      searchTerm: values,
    });
    const appendBlocks: Block[] = [];

    if (confluenceEnabled) {
      const { accessToken, siteUrl } = await getUserConfluenceAccessToken(orgId, userId);
      if (accessToken) {
        const searchResponse = await searchWithText(accessToken, values);
        const results = searchResponse.results;
        const confluenceBlocks = getConfluencePageBlocks(results, siteUrl);
        appendBlocks.push(...confluenceBlocks);
      }
    }

    //update the modal view

    const threadBlocks = getThreadBlocks(threadResults);

    appendBlocks.push(...threadBlocks);

    const updatedModal = createSearchModal().appendBlocksToBaseView(appendBlocks, viewId, viewHash);

    client.views.update(updatedModal);
  });
};

export const searchConfluenceCheckHandler = (app: App) => {
  app.action(searchConfluenceCheckedActionId, async ({ ack, body, client }) => {
    try {
      await ack();
      const payload = body as BlockAction;
      const userId = payload.user.id;
      const orgId = payload.team?.id;
      const view = payload.view;
      const actions = payload.actions;
      const action = actions[0] as CheckboxesAction;
      const option = action.selected_options[0];
      if (!orgId || !userId || !view) {
        throw new Error("Missing orgId or userId");
      }
      //if unselected, option will be undefined
      if (option) {
        const initialConfig = {
          [searchConfluneceBlockId]: [searchConfluenceOption],
        };
        const searchModalMaker = createSearchModal(initialConfig);

        const confluenceAuth = await getUserConfluenceAuth(orgId, userId);
        let appendBlocks;
        if (!confluenceAuth || confluenceAuth.length < 1) {
          const authorizeUrl = getAuthorizeUrl(orgId, userId);
          appendBlocks = confluenceAuthView(authorizeUrl);
        } else {
          const siteUrl = confluenceAuth[0].siteUrl;
          appendBlocks = confluenceSiteDisplay(siteUrl);
        }
        const newModalView = searchModalMaker.appendBlocksToBaseView(
          appendBlocks,
          view?.id,
          view?.hash,
        );
        console.log("newModal view ", JSON.stringify(newModalView));
        await client.views.update(newModalView);
        return;
      }
      //if unselected, option will be undefined
      if (!option) {
        const searchModalMaker = createSearchModal();
        const baseView = searchModalMaker.appendBlocksToBaseView([], view?.id, view?.hash);
        await client.views.update(baseView);
      }
    } catch (error) {
      console.error(error);
    }
  });
};

export const searchHandlers = (app: App) => {
  searchButtonHandler(app);
  searchModalHandler(app);
  searchConfluenceCheckHandler(app);
};
