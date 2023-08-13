function base64UrlEncode(data: string): string {
    const base64 = Buffer.from(data).toString('base64');
    return base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
}

function base64UrlDecode(data: string): string {
    data += new Array(5 - data.length % 4).join('=');
    data = data.replace('-', '+').replace('_', '/');
    return Buffer.from(data, 'base64').toString();
}

export const getAuthorizeUrl = (orgId: string, userId: string, confluenceUrl: string) => {
    const uniqueId = `${orgId}-${userId}-${confluenceUrl}`;
    const encodedUniqueId = base64UrlEncode(uniqueId);
    const authUrl = process.env.CONFLUENCE_AUTH_URL;

    if(!authUrl) throw new Error('Missing auth url');

    return authUrl.replace('${YOUR_USER_BOUND_VALUE}', encodedUniqueId);
}

export const parseAuthorizeUrlState = (state: string) => {
    const decodedState = base64UrlDecode(state);
    const stateItems = decodedState.split('-');

    if (stateItems.length < 3) throw new Error('Invalid state format');
    
    return {
        orgId: stateItems[0],
        userId: stateItems[1],
        confluenceSiteUrl: stateItems.slice(2).join('-')  // This accounts for any '-' that might exist within the confluenceSiteUrl
    }
}
