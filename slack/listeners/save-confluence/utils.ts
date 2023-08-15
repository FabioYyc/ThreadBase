import { userUIRepo } from "../../../common/modules/userUI"

export const getUserConfluenceAuth = async (orgId:string, userId: string) => {
    const userUI = await userUIRepo.getUserUIByUserId(orgId, userId)
    if(!userUI) {
        return false
    }

    const confluenceAuth = userUI.auth?.confluence

    if(!confluenceAuth || !confluenceAuth.length) {
        return false
    }

    return confluenceAuth
}