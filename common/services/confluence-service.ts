import { joinUrls } from "../utils/auth-url-utils";

export type IAuthPayload = {
  grant_type: string;
  client_id: string;
  client_secret: string;
  code?: string;
  redirect_uri: string;
  refresh_token?: string;
};

export interface ICloudIdResponse {
  id: string;
  url: string;
}

export const getAccessToken = async ({
  authorizeCode,
  type,
  refresh_token,
}: {
  authorizeCode?: string;
  type: "authorize" | "refresh";
  refresh_token?: string;
}): Promise<any> => {
  const url = "https://auth.atlassian.com/oauth/token";

  if (
    !process.env.CONFLUENCE_APP_CLIENT_ID ||
    !process.env.CONFLUENCE_APP_SECRET ||
    !process.env.CONFLUENCE_AUTH_URL
  ) {
    throw new Error("Missing environment variables");
  }

  // Extract redirect_uri from CONFLUENCE_AUTH_URL
  const parsedUrl = new URL(process.env.CONFLUENCE_AUTH_URL);
  const redirectUri = parsedUrl.searchParams.get("redirect_uri");

  if (!redirectUri) {
    throw new Error("Redirect URI not found in CONFLUENCE_AUTH_URL");
  }
  const grantType = type === "authorize" ? "authorization_code" : "refresh_token";

  const payload: IAuthPayload = {
    grant_type: grantType,
    client_id: process.env.CONFLUENCE_APP_CLIENT_ID,
    client_secret: process.env.CONFLUENCE_APP_SECRET,
    redirect_uri: redirectUri,
  };

  if (type === "refresh" && !refresh_token) {
    throw new Error("Refresh token not found");
  }

  if (type === "authorize" && !authorizeCode) {
    throw new Error("Authorize code not found");
  }

  if (type === "refresh") {
    payload["refresh_token"] = refresh_token;
  }

  if (type === "authorize") {
    payload["code"] = authorizeCode;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.warn("Error in getAccessToken: %o", url, payload, response.statusText);
    return false;
  }

  return await response.json();
};

// Usage:
// getAccessToken('YOUR_AUTHORIZATION_CODE')
//     .then(data => console.log(data))
//     .catch(error => console.error(error));

export const getAccessibleResource = async (accessToken: string): Promise<ICloudIdResponse> => {
  const url = "https://api.atlassian.com/oauth/token/accessible-resources";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const res = await response.json();
  return res[0];
};

export const fetchCfUrl = async ({
  cloudId,
  accessToken,
  path,
  method,
  body,
}: {
  cloudId: string;
  accessToken: string;
  path: string;
  method: "GET" | "POST";
  body?: any;
}) => {
  const baseUrl = `https://api.atlassian.com/ex/confluence/${cloudId}`;
  const url = joinUrls(baseUrl, path);
  console.log("url is ", url);

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const requestParams: RequestInit = {
    method,
    headers: headers,
  };
  if (method === "POST" && body) {
    requestParams["body"] = JSON.stringify(body);
  }
  const response = await fetch(url, requestParams);

  if (!response.ok) {
    console.warn("Error in fetch cf url: %o", response.statusText);
    console.log("request params", requestParams);
    return false;
  }
  return await response.json();
};
