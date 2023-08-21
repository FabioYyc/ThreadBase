import { IConfluenceAuth, userUIRepo } from "../../../common/modules/userUI"
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

export const getSaveConfluenceViewData = async ({ orgId, userId, confluenceAuth }: { orgId: string, userId: string, confluenceAuth: IConfluenceAuth }) => {
    const accessTokenRes = await getAccessToken({ type: 'refresh', refresh_token: confluenceAuth.refreshToken })
    if (!accessTokenRes) {
        console.error('Error in getAccessToken', accessTokenRes.statusText)
        return false
    }
    const { refresh_token, access_token } = accessTokenRes
    const newConfluenceAuth: IConfluenceAuth = {
        siteUrl: confluenceAuth.siteUrl,
        refreshToken: refresh_token,
    }
    await userUIRepo.updateAuthByUserId({ orgId, userId, authType: 'confluence', authData: newConfluenceAuth })
    const pages = await getCfPages(access_token)

    return { pages }
}