import { MessageShortcut } from "@slack/bolt";
import { sessionRepo } from "../../../common/modles/session";
import { userUIRepo } from "../../../common/modles/userUI";
import { getAuthorizeUrl } from "../../../common/utils/auth-url-utils";
import { getPermalinkWithTimeout } from "../../apis/messages";
import { getAccessTokenFromRefreshToken, getSaveConfluenceViewData } from "./apis";
import { IPage } from "./constants";
import { SaveConfluenceViews } from "./view";
import { WebClient } from "@slack/web-api";

export const getUserConfluenceAuth = async (orgId: string, userId: string) => {
  const userUI = await userUIRepo.getUserUIByUserId(orgId, userId);
  if (!userUI) {
    return false;
  }

  const confluenceAuth = userUI.auth?.confluence;

  if (!confluenceAuth || !confluenceAuth.length) {
    return false;
  }
  return confluenceAuth;
};

export const formatPageValue = (page: IPage) => {
  return `${page.id}-${page.spaceId}`;
};

export const getPageDataFromValue = (value: string) => {
  return {
    pageId: value.split("-")[0],
    spaceId: value.split("-")[1],
  };
};

export const getSessionFromId = async (sessionId: string) => {
  const session = await sessionRepo.getSessionById(sessionId);
  if (session && session.expiresAt && session.expiresAt > Date.now()) {
    return session;
  }
};

export const getCorrectConfluenceViewByAuth = async (
  orgId: string,
  userId: string,
  messageShortcut: MessageShortcut,
  client: WebClient,
) => {
  const confluenceAuthList = await getUserConfluenceAuth(orgId, userId);
  const confluenceViewCreator = SaveConfluenceViews();
  const authorizeUrl = getAuthorizeUrl(orgId, userId);
  const authView = confluenceViewCreator.authModal(authorizeUrl);
  if (!confluenceAuthList || confluenceAuthList.length < 1) {
    return authView;
  }
  const firstSite = confluenceAuthList[0];
  const { accessToken } = await getAccessTokenFromRefreshToken({
    orgId,
    userId,
    confluenceAuth: firstSite,
    createNewSession: true,
  });

  if (!accessToken) {
    return authView;
  }

  const cfInfo = await getSaveConfluenceViewData(accessToken);

  if (!cfInfo) {
    return authView;
  }

  const messageLink = await getPermalinkWithTimeout(
    client,
    messageShortcut.channel.id,
    messageShortcut.message_ts,
  );

  const session = await sessionRepo.getValidSessionForUser(orgId, userId, firstSite.siteUrl);
  return confluenceViewCreator.saveToConfluencePageModal({
    confluenceSiteUrl: firstSite.siteUrl,
    pages: cfInfo.pages,
    messageLink: messageLink || "",
    sessionId: session._id,
  });
};
