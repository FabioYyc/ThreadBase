import { sessionRepo } from "../../../common/modles/session";
import { userUIRepo } from "../../../common/modles/userUI";
import { IPage } from "./constants";

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
