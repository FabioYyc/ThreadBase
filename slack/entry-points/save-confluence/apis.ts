import { getAccessibleResource, fetchCfUrl } from "../../../common/services/confluence-service";
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
