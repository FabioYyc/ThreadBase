export const getAuthorizeUrl = (orgId: string, userId: string) => {
    const uniqueId = `${orgId}-${userId}`;
    const authUrl = process.env.CONFLUENCE_AUTH_URL;

    if(!authUrl) throw new Error('Missing auth url')

    return authUrl.replace('${YOUR_USER_BOUND_VALUE', uniqueId) 
}