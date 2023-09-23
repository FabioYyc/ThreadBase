import {
  Action,
  App,
  Block,
  BlockAction,
  ButtonAction,
  CheckboxesAction,
  KnownBlock,
  PlainTextInputAction,
} from "@slack/bolt";
import {
  searchButtonActionId,
  searchConfluenceCheckedActionId,
  searchConfluenceLogoutActionId,
  searchConfluneceCheckBlockId,
  searchDispatchActionId,
  searchInputBlockId,
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
import { searchConfluenceWithText } from "./apis";
import { UserRepo } from "../../../../common/models/user";
import { sessionRepo } from "../../../../common/models/session";

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

const searchModalDispatchSearchHandler = async (app: App) => {
  app.action(searchDispatchActionId, async ({ ack, body, client }) => {
    await ack();
    const payload = body as BlockAction;
    const userId = payload.user.id;
    const orgId = payload.team?.id;
    const viewHash = payload.view?.hash;
    const viewId = payload.view?.id;
    const action = payload.actions[0] as PlainTextInputAction;
    const searchTerm = action.value;
    const confluenceEnabledCheckbox =
      payload.view?.state.values[searchConfluneceCheckBlockId][searchConfluenceCheckedActionId]
        .selected_options;
    const confluenceEnabled = confluenceEnabledCheckbox && confluenceEnabledCheckbox.length > 0;

    if (!orgId || !userId || !searchTerm || !viewHash || !viewId) {
      throw new Error("Missing orgId, userId, value or viewHash");
    }
    const teams = await getTeamsForUser(orgId, userId);
    const teamIds = teams.map((team) => team.id);
    const threadResults = await threadRepo.searchByText({
      orgId,
      userId,
      teamIds,
      searchTerm: searchTerm,
    });
    const appendBlocks: Block[] = [];

    const initialConfig = {
      [searchConfluneceCheckBlockId]: confluenceEnabled ? [searchConfluenceOption] : [],
      [searchInputBlockId]: searchTerm,
    };

    if (confluenceEnabled) {
      const { accessToken, siteUrl } = await getUserConfluenceAccessToken(orgId, userId);
      if (accessToken) {
        const searchResponse = await searchConfluenceWithText(accessToken, searchTerm);
        const results = searchResponse.results;
        const confluenceBlocks = getConfluencePageBlocks(results, siteUrl);
        appendBlocks.push(...confluenceSiteDisplay(siteUrl));
        appendBlocks.push(...confluenceBlocks);
      }
    }

    //update the modal view

    const threadBlocks = getThreadBlocks(threadResults);

    appendBlocks.push(...threadBlocks);

    const updatedModal = createSearchModal(initialConfig).appendBlocksToBaseView(
      appendBlocks,
      viewId,
      viewHash,
    );

    await client.views.update(updatedModal);
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

      if (!orgId || !userId || !view) {
        throw new Error("Missing orgId or userId");
      }

      //if unselected, option will be undefined
      if (searchConfluenceOption) {
        const initialConfig = {
          [searchConfluneceCheckBlockId]: [
            action.selected_options[0] ? searchConfluenceOption : undefined,
          ],
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
        await client.views.update(newModalView);
        return;
      }
      //if unselected, option will be undefined
      if (!searchConfluenceOption) {
        console.log("push unselected view");
        const searchModalMaker = createSearchModal();
        const baseView = searchModalMaker.appendBlocksToBaseView([], view?.id, view?.hash);
        await client.views.update(baseView);
      }
    } catch (error) {
      console.error(error);
    }
  });
};

const logoutHandler = (app: App) => {
  app.action(searchConfluenceLogoutActionId, async ({ ack, body, client, payload }) => {
    ack();
    const actionBody = body as BlockAction;
    const userId = actionBody.user.id;
    const orgId = actionBody.team?.id;
    const siteUrl = (actionBody.actions[0] as ButtonAction).value;
    if (!orgId || !userId || !siteUrl) {
      throw new Error("Missing orgId, userId or siteUrl");
    }
    const userRepo = UserRepo();
    await userRepo.removeConfluenceAuth({ orgId, userId });
    await sessionRepo.removeSession(orgId, userId, siteUrl);

    const initialConfig = {
      [searchConfluneceCheckBlockId]: [searchConfluenceOption],
    };

    const searchModalMaker = createSearchModal(initialConfig);

    const authorizeUrl = getAuthorizeUrl(orgId, userId);
    const appendBlocks = confluenceAuthView(authorizeUrl);

    if (!actionBody.view?.id || !actionBody.view?.hash) {
      console.log(actionBody);
      throw new Error("Missing view id or hash");
    }
    const newSearchView = searchModalMaker.appendBlocksToBaseView(
      appendBlocks,
      actionBody.view.id,
      actionBody.view.hash,
    );

    await client.views.update(newSearchView);
  });
};

export const searchHandlers = (app: App) => {
  searchButtonHandler(app);
  searchModalDispatchSearchHandler(app);
  searchConfluenceCheckHandler(app);
  logoutHandler(app);
};
