import { Block, KnownBlock } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { sessionRepo } from "../../../../common/models/session";
import {
  getAccessTokenFromRefreshToken,
  getUserConfluenceAuth,
} from "../../../shared/confluence/utils";
import { createSearchModal } from "./views";

export const getUserConfluenceAccessToken = async (orgId: string, userId: string) => {
  const confluenceAuth = await getUserConfluenceAuth(orgId, userId);
  if (!confluenceAuth || confluenceAuth.length < 1) {
    return {};
  }
  const firstSite = confluenceAuth[0];
  const session = await sessionRepo.getValidSessionForUser(orgId, userId, firstSite.siteUrl);
  if (session) {
    return { accessToken: session.accessToken, siteUrl: firstSite.siteUrl };
  }
  const { accessToken } = await getAccessTokenFromRefreshToken({
    orgId,
    userId,
    confluenceAuth: firstSite,
    createNewSession: true,
  });
  return { accessToken, siteUrl: firstSite.siteUrl };
};

export const showLoading = async ({
  loadingMessage,
  client,
  viewId,
  viewHash,
  searchModal,
}: {
  loadingMessage: string;
  client: WebClient;
  viewId: string;
  viewHash: string;
  searchModal: any;
}): Promise<string> => {
  const loadingBlocks: (Block | KnownBlock)[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: loadingMessage,
      },
    },
  ];
  const loadingModal = searchModal.replaceBlocksInBaseView(loadingBlocks, viewId, viewHash);

  const loadingRes = (await client.views.update(loadingModal)) as any;

  const newHash = loadingRes.view.hash;

  return newHash;
};
