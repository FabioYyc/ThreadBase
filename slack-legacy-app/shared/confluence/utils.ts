import { sessionRepo } from "../../../common/models/session";
import { IConfluenceAuth, UserRepo } from "../../../common/models/user";
import { getAccessToken } from "../../../common/services/confluence-service";

export const logout = async (orgId: string, userId: string) => {
  const userRepo = UserRepo();
  const user = await userRepo.getUserUIByUserId(orgId, userId);
  if (!user) {
    throw new Error("User not found");
  }
  const confluenceAuth = user.auth?.confluence;
  if (!confluenceAuth || !confluenceAuth.length) {
    throw new Error("Confluence auth not found");
  }
  await userRepo.removeConfluenceAuth({
    orgId,
    userId,
  });
};

export const getAccessTokenFromRefreshToken = async ({
  orgId,
  userId,
  siteUrl,
  confluenceAuth,
  createNewSession = false,
}: {
  orgId: string;
  userId: string;
  siteUrl?: string;
  confluenceAuth?: IConfluenceAuth;
  createNewSession?: boolean;
}) => {
  const siteUrlToUse = siteUrl || confluenceAuth?.siteUrl;

  if (!siteUrlToUse) {
    throw new Error("Missing siteUrl");
  }

  const session = await sessionRepo.getValidSessionForUser(orgId, userId, siteUrlToUse);

  if (session) {
    return { accessToken: session.accessToken };
  }

  if (!confluenceAuth) {
    throw new Error("Missing confluenceAuth and Session");
  }
  const accessTokenRes = await getAccessToken({
    type: "refresh",
    refresh_token: confluenceAuth.refreshToken,
  });

  if (!accessTokenRes) {
    console.error("Error in getAccessToken", accessTokenRes.statusText);
    throw new Error("Error in getAccessToken");
  }

  const { refresh_token, access_token, expires_in } = accessTokenRes;
  const accessToken = access_token as string;

  if (createNewSession) {
    const expiresAt = Date.now() + expires_in * 1000;
    await sessionRepo.createOrUpdate({
      orgId,
      userId,
      confluenceSiteUrl: confluenceAuth.siteUrl,
      accessToken,
      expiresAt,
    });
  }

  const newConfluenceAuth: IConfluenceAuth = {
    siteUrl: confluenceAuth.siteUrl,
    refreshToken: refresh_token,
  };
  const userRepo = UserRepo();
  await userRepo.createOrUpdateUserAuth({
    orgId,
    userId,
    authType: "confluence",
    authData: newConfluenceAuth,
  });
  return { accessToken };
};

export const getUserConfluenceAuth = async (orgId: string, userId: string) => {
  const userRepo = UserRepo();
  const userUI = await userRepo.getUserUIByUserId(orgId, userId);
  if (!userUI) {
    return false;
  }

  const confluenceAuth = userUI.auth?.confluence;

  if (!confluenceAuth || !confluenceAuth.length) {
    return false;
  }
  return confluenceAuth;
};
