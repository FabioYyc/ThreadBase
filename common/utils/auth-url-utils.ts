function base64UrlEncode(data: string): string {
  const base64 = Buffer.from(data).toString("base64");
  return base64.replace("+", "-").replace("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  data += new Array(5 - (data.length % 4)).join("=");
  data = data.replace("-", "+").replace("_", "/");
  return Buffer.from(data, "base64").toString();
}

export const getAuthorizeUrl = (orgId: string, userId: string) => {
  const uniqueId = `${orgId}-${userId}`;
  const encodedUniqueId = base64UrlEncode(uniqueId);
  let authUrl = process.env.CONFLUENCE_AUTH_URL;

  if (!authUrl) throw new Error("Missing auth url");

  // Add offline_access to the scope parameter
  const scopeParam = "scope=";
  const scopeIndex = authUrl.indexOf(scopeParam);

  if (scopeIndex === -1) {
    throw new Error("Scope parameter not found in auth URL");
  }

  const scopeStart = scopeIndex + scopeParam.length;
  const scopeEnd = authUrl.indexOf("&", scopeStart);

  const existingScopes = authUrl.slice(scopeStart, scopeEnd === -1 ? undefined : scopeEnd);
  const newScopes = `${existingScopes}%20offline_access`;

  authUrl =
    authUrl.slice(0, scopeStart) + newScopes + (scopeEnd === -1 ? "" : authUrl.slice(scopeEnd));

  return authUrl.replace("${YOUR_USER_BOUND_VALUE}", encodedUniqueId);
};

export const parseAuthorizeUrlState = (state: string) => {
  const decodedState = base64UrlDecode(state);
  const stateItems = decodedState.split("-");

  if (stateItems.length < 2) throw new Error("Invalid state format");

  return {
    orgId: stateItems[0],
    userId: stateItems[1],
  };
};

export const joinUrls = (...urls: string[]) => {
  return urls
    .map((url) => {
      // Trim starting and ending slashes
      return url.replace(/^\/+|\/+$/g, "");
    })
    .join("/");
};
