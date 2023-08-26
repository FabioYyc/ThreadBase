import { sessionRepo } from "../../../common/modles/session";
import { IConfluenceAuth, userUIRepo } from "../../../common/modles/userUI";
import {
  getAccessibleResource,
  fetchCfUrl,
  getAccessToken,
} from "../../../common/services/confluence-service";
import { stringInputParser } from "../../utils";
import {
  ICreateCfPageRequestPayload,
  ICreateCfPageResponse,
  IPage,
  ISpace,
  SaveConfluencePayload,
} from "./constants";
import { getPageDataFromValue } from "./utils";

export const getCfPages = async (accessToken: string) => {
  const resource = await getAccessibleResource(accessToken);
  const pageRes = await fetchCfUrl({
    cloudId: resource.id,
    accessToken,
    path: "/wiki/api/v2/pages",
    method: "GET",
  });
  return pageRes.results as IPage[];
};

export const getCfSpaces = async (accessToken: string) => {
  const resource = await getAccessibleResource(accessToken);
  const spaces = await fetchCfUrl({
    cloudId: resource.id,
    accessToken,
    path: "/wiki/api/v2/spaces",
    method: "GET",
  });
  return spaces.results as ISpace[];
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
  await userUIRepo.updateAuthByUserId({
    orgId,
    userId,
    authType: "confluence",
    authData: newConfluenceAuth,
  });
  return { accessToken };
};

export const getSaveConfluenceViewData = async (accessToken: string) => {
  const pages = await getCfPages(accessToken);

  return { pages };
};

export const createNewPage = async ({
  accessToken,
  viewPayload,
}: {
  accessToken: string;
  viewPayload: SaveConfluencePayload;
}) => {
  try {
    const resource = await getAccessibleResource(accessToken);
    const pageValue = viewPayload["parent-page"].selected_option.value;
    const title = stringInputParser(viewPayload.title);
    const { pageId, spaceId } = getPageDataFromValue(pageValue);
    const requestBody: ICreateCfPageRequestPayload = {
      spaceId,
      title,
      body: {
        representation: "wiki",
        value: stringInputParser(viewPayload.content),
      },
      parentId: pageId,
    };

    const pageRes = await fetchCfUrl({
      cloudId: resource.id,
      accessToken,
      path: "/wiki/api/v2/pages",
      method: "POST",
      body: requestBody,
    });
    return pageRes as ICreateCfPageResponse;
  } catch (error) {
    console.log("error in createNewPage with payload", viewPayload);
    throw error;
  }
};
