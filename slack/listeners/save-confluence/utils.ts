import { create } from "lodash"
import { sessionRepo } from "../../../common/modles/session"
import { IConfluenceAuth, userUIRepo } from "../../../common/modles/userUI"
import { fetchCfUrl, getAccessToken, getCloudId } from "../../../common/services/confluence-service"
import { IPage, ISpace } from "./constants"


export const getUserConfluenceAuth = async (orgId: string, userId: string) => {
    const userUI = await userUIRepo.getUserUIByUserId(orgId, userId)
    if (!userUI) {
        return false
    }

    const confluenceAuth = userUI.auth?.confluence

    if (!confluenceAuth || !confluenceAuth.length) {
        return false
    }
    return confluenceAuth
}

export const getCfPages = async (accessToken: string) => {
    const cloudId = await getCloudId(accessToken)
    const pageRes = await fetchCfUrl({ cloudId, accessToken, path: '/wiki/api/v2/pages', method: 'GET' })
    return pageRes.results as IPage[]
}


export const getCfSpaces = async (accessToken: string) => {
    const cloudId = await getCloudId(accessToken)
    const spaces = await fetchCfUrl({ cloudId, accessToken, path: '/wiki/api/v2/spaces', method: 'GET' })
    return spaces.results as ISpace[]
}


export const getAccessTokenFromRefreshToken = async ({ orgId, userId, confluenceAuth, createNewSession=false }: { orgId: string, userId: string, confluenceAuth: IConfluenceAuth, createNewSession?: boolean }) => {
    const session = await sessionRepo.getValidSessionForUser(orgId, userId, confluenceAuth.siteUrl);
    
    if(session){
        return {accessToken: session.accessToken}
    }

    const accessTokenRes = await getAccessToken({ type: 'refresh', refresh_token: confluenceAuth.refreshToken })
    if (!accessTokenRes) {
        console.error('Error in getAccessToken', accessTokenRes.statusText)
        throw new Error('Error in getAccessToken')
    }
    const { refresh_token, access_token, expires_in } = accessTokenRes
    
    if(createNewSession){
        const expiresAt = Date.now() + expires_in * 1000
        await sessionRepo.create({ orgId, userId, confluenceSiteUrl: confluenceAuth.siteUrl, accessToken: access_token, expiresAt })
    }

    const newConfluenceAuth: IConfluenceAuth = {
        siteUrl: confluenceAuth.siteUrl,
        refreshToken: refresh_token,
    }
    await userUIRepo.updateAuthByUserId({ orgId, userId, authType: 'confluence', authData: newConfluenceAuth })
    return {accessToken: access_token }
}

export const getSaveConfluenceViewData = async (accessToken: string) => {
    const pages = await getCfPages(accessToken)

    return { pages }
}