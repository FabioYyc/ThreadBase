import { App, MessageShortcut } from "@slack/bolt";
import { joinUrls } from "../../../common/utils/auth-url-utils";
import { SaveConfluenceViews } from "./view";
import { SaveConfluencePayload, saveConfluenceCallbackId } from "./constants";
import { getCorrectConfluenceViewByAuth, getSessionFromId } from "./utils";
import { viewInputReader } from "../../utils";
import { createNewPage, getAccessTokenFromRefreshToken } from "./apis";

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

export const registerConfluenceHandlers = (app: App) => {
  saveConfluenceShortcutHandler(app);
  saveConfluenceCallbackHandler(app);
};
