import { fetchCfUrl, getAccessibleResource } from "../../../../common/services/confluence-service";
import { searchConfluenceTimeout } from "./constants";

export const searchConfluenceWithText = async (accessToken: string, text: string) => {
  const timeout = (ms: number) => {
    return new Promise((_, resolve) => setTimeout(() => {
      return resolve({results: []}) }, ms));
  };

  const fetchData = async () => {
    const resource = await getAccessibleResource(accessToken);
    //TODO: make this multi-step search, user will request for more results if they want
    const results = await fetchCfUrl({
      cloudId: resource.id,
      accessToken,
      path: "/wiki/rest/api/search",
      method: "GET",
      queryParams: {
        cql: `(type=page AND title ~ ${text} AND space in recentlyViewedSpaces(5))`,
        limit: 10
      },
    });
    return results;
  };

  return await Promise.race([fetchData(), timeout(searchConfluenceTimeout)]);
};
