import { App, BlockAction, MessageShortcut, PlainTextInputAction } from "@slack/bolt";
import { getAuthorizeUrl, joinUrls } from "../../../common/utils/auth-url-utils";
import { SaveConfluenceViews } from "./view";
import {
  SaveConfluencePayload,
  confluenceDomainActionId,
  saveConfluenceCallbackId,
} from "./constants";
import { getSessionFromId, getUserConfluenceAuth } from "./utils";
import { getPermalinkWithTimeout } from "../../apis/messages";
import { viewInputReader } from "../../utils";
import { createNewPage, getAccessTokenFromRefreshToken, getSaveConfluenceViewData } from "./apis";
import { sessionRepo } from "../../../common/modles/session";

const saveConfluenceShortcutHandler = async (app: App) => {
  return app.shortcut("create-confluence", async ({ shortcut, ack, client }) => {
    ack();
    const orgId = shortcut.team?.id;
    const userId = shortcut.user.id;
    if (!orgId || !userId) {
      throw new Error("Missing orgId or userId");
    }
    const confluenceAuthList = await getUserConfluenceAuth(orgId, userId);
    const confluenceViewCreator = SaveConfluenceViews();
    let confluenceView = confluenceViewCreator.setDomainView();

    if (confluenceAuthList && confluenceAuthList.length > 0) {
      const firstSite = confluenceAuthList[0];
      const { accessToken } = await getAccessTokenFromRefreshToken({
        orgId,
        userId,
        confluenceAuth: firstSite,
        createNewSession: true,
      });
      const cfInfo = await getSaveConfluenceViewData(accessToken);

      if (cfInfo) {
        const messageShortcut = shortcut as MessageShortcut;
        const messageLink = await getPermalinkWithTimeout(
          client,
          messageShortcut.channel.id,
          messageShortcut.message_ts,
        );

        const session = await sessionRepo.getValidSessionForUser(orgId, userId, firstSite.siteUrl);
        confluenceView = confluenceViewCreator.saveToConfluencePageModal({
          confluenceSiteUrl: firstSite.siteUrl,
          pages: cfInfo.pages,
          messageLink: messageLink || "",
          sessionId: session._id,
        });
      }
    }

    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: confluenceView,
    });
  });
};

const setDomainHandler = (app: App) => {
  return app.action(confluenceDomainActionId, async ({ ack, body, client }) => {
    const confluenceAuthView = SaveConfluenceViews();
    const payload = body as BlockAction;
    const userId = payload.user.id;
    const orgId = payload.team?.id;
    const viewHash = payload.view?.hash;
    const viewId = payload.view?.id;
    const action = payload.actions[0] as PlainTextInputAction;
    const value = action.value;

    if (!orgId || !userId || !value || !viewHash || !viewId) {
      throw new Error("Missing orgId, userId, value or viewHash");
    }

    const confluenceSiteUrl = value;
    const authorizeUrl = getAuthorizeUrl(orgId, userId, confluenceSiteUrl);

    const setAuthViewModal = confluenceAuthView.appendLinkButton(
      authorizeUrl,
      confluenceSiteUrl,
      viewId,
      viewHash,
    );

    await client.views.update(setAuthViewModal);
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
      const linkToPage = joinUrls(`https://${siteUrl}`, "wiki", createPageRes._links.webui);

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

export const registerConfluenceHandlers = (app: App) => {
  saveConfluenceShortcutHandler(app);
  setDomainHandler(app);
  saveConfluenceCallbackHandler(app);
};
