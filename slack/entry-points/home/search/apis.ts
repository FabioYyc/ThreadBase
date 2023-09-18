import { fetchCfUrl, getAccessibleResource } from "../../../../common/services/confluence-service";
import { searchConfluenceTimeout } from "./constants";

export const searchConfluenceWithText = async (accessToken: string, text: string) => {
  const timeout = (ms: number) => {
    return new Promise((_, resolve) => setTimeout(() => {
      return resolve({results: []}) }, ms));
  };

  const fetchData = async () => {
    const resource = await getAccessibleResource(accessToken);
    const results = await fetchCfUrl({
      cloudId: resource.id,
      accessToken,
      path: "/wiki/rest/api/search",
      method: "GET",
      queryParams: {
        cql: `(type=page AND text ~ "${text}")`,
        limit: 10
      },
    });
    return results;
  };

  return await Promise.race([fetchData(), timeout(searchConfluenceTimeout)]);
};
