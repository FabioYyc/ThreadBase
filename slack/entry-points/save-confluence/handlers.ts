import { App, BlockAction, MessageShortcut } from "@slack/bolt";
import { getAuthorizeUrl, joinUrls } from "../../../common/utils/auth-url-utils";
import { SaveConfluenceViews } from "./view";
import {
  SaveConfluencePayload,
  saveConfluenceLogoutActionId,
  saveConfluenceCallbackId,
} from "./constants";
import { getAuthView, getCorrectConfluenceViewByAuth, getSessionFromId } from "./utils";
import { viewInputReader } from "../../utils";
import { createNewPage } from "./apis";
import { UserRepo } from "../../../common/models/user";
import { sessionRepo } from "../../../common/models/session";
import {
  getAccessTokenFromRefreshToken,
  getUserConfluenceAuth,
} from "../../shared/confluence/utils";

const saveConfluenceShortcutHandler = async (app: App) => {
  return app.shortcut("create-confluence", async ({ shortcut, ack, client }) => {
    ack();
    const orgId = shortcut.team?.id;
    const userId = shortcut.user.id;
    if (!orgId || !userId) {
      throw new Error("Missing orgId or userId");
    }

    const confluenceView = await getCorrectConfluenceViewByAuth(
      orgId,
      userId,
      shortcut as MessageShortcut,
      client,
    );

    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: confluenceView,
    });
  });
};

export const saveConfluenceCallbackHandler = (app: App) => {
  app.view(saveConfluenceCallbackId, async ({ ack, payload, body, client }) => {
    try {
      ack();
      const sessionId = payload.external_id;
      const userId = body.user.id;
      const orgId = payload.team_id;

      if (!sessionId) {
        throw new Error("Missing sessionId");
      }

      const viewPayload = viewInputReader<SaveConfluencePayload>(payload);
      const session = await getSessionFromId(sessionId);
      let accessToken = session?.accessToken;
      const siteUrl = payload.private_metadata;

      if (!session) {
        const newAccessToken = await getAccessTokenFromRefreshToken({
          orgId,
          userId,
          siteUrl,
        });
        accessToken = newAccessToken.accessToken;
      }

      if (!accessToken) {
        throw new Error("Missing accessToken");
      }

      const createPageRes = await createNewPage({
        accessToken,
        viewPayload,
      });

      const domain = siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`;
      const linkToPage = joinUrls(domain, "wiki", createPageRes._links.webui);

      const successMessage = SaveConfluenceViews().successMessage(linkToPage, createPageRes.title);

      client.chat
        .postMessage({
          channel: body.user.id,
          token: process.env.SLACK_BOT_TOKEN,
          blocks: successMessage,
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(`error in save confluence: ${error}`);
    }
  });
};

const logoutHandler = (app: App) => {
  app.action(saveConfluenceLogoutActionId, async ({ ack, body, client, payload }) => {
    ack();
    const actionBody = body as BlockAction;
    //TODO: Make this a shared function between save-confluence and search with confluence
    const orgId = actionBody.team?.id;
    const userId = actionBody.user.id;

    const userRepo = UserRepo();
    if (!orgId || !userId) {
      throw new Error("Missing orgId or userId");
    }
    let confluenceSiteUrl = actionBody?.view?.private_metadata;

    if (!confluenceSiteUrl) {
      const userConfluenceAuth = await getUserConfluenceAuth(orgId, userId);
      if (!userConfluenceAuth || userConfluenceAuth.length < 1) {
        throw new Error("Missing confluence auth");
      }
      confluenceSiteUrl = userConfluenceAuth[0].siteUrl;
    }

    await userRepo.removeConfluenceAuth({ orgId, userId });
    await sessionRepo.removeSession(orgId, userId, confluenceSiteUrl);
    const confluenceViewCreator = SaveConfluenceViews();
    const authView = getAuthView(orgId, userId, confluenceViewCreator);

    if (!actionBody.view?.id) {
      console.log(actionBody);
      throw new Error("Missing view id");
    }
    client.views.update({
      view_id: actionBody.view.id,
      hash: actionBody.view.hash,
      view: authView,
    });
  });
};

export const registerConfluenceHandlers = (app: App) => {
  saveConfluenceShortcutHandler(app);
  saveConfluenceCallbackHandler(app);
  logoutHandler(app);
};
