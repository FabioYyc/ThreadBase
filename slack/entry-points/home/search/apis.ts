import { fetchCfUrl, getAccessibleResource } from "../../../../common/services/confluence-service";

export const searchWithText = async (accessToken: string, text: string) => {
  const resource = await getAccessibleResource(accessToken);
  const results = await fetchCfUrl({
    cloudId: resource.id,
    accessToken,
    path: "/wiki/rest/api/search",
    method: "GET",
    queryParams: {
      cql: `text ~ "${text}"`,
    },
  });
  return results;
};
