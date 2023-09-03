import { sessionRepo } from "../../../../common/models/session";
import {
  getAccessTokenFromRefreshToken,
  getUserConfluenceAuth,
} from "../../../shared/confluence/utils";

export const getUserConfluenceAccessToken = async (orgId: string, userId: string) => {
  const confluenceAuth = await getUserConfluenceAuth(orgId, userId);
  if (!confluenceAuth || confluenceAuth.length < 1) {
    return;
  }
  const firstSite = confluenceAuth[0];
  const session = await sessionRepo.getValidSessionForUser(orgId, userId, firstSite.siteUrl);
  if (session) {
    return session.accessToken;
  }
  const { accessToken } = await getAccessTokenFromRefreshToken({
    orgId,
    userId,
    confluenceAuth: firstSite,
    createNewSession: true,
  });
  return accessToken;
};
