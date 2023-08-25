import { App, BlockAction, MessageShortcut, PlainTextInputAction } from "@slack/bolt"
import { getAuthorizeUrl } from "../../../common/utils/auth-url-utils"
import { createConfluenceAuthModal } from "./view"
import { confluenceDomainActionId } from "./constants"
import { getAccessTokenFromRefreshToken, getSaveConfluenceViewData, getUserConfluenceAuth } from "./utils"
import { getPermalinkWithTimeout } from "../../apis/messages"

const saveConfluenceShortcutHandler = async (app: App) => {
    return app.shortcut('create-confluence', async ({ shortcut, ack, client }) => {
        ack()
        const orgId = shortcut.team?.id
        const userId = shortcut.user.id
        if (!orgId || !userId) {
            throw new Error('Missing orgId or userId')
        }
        const confluenceAuthList = await getUserConfluenceAuth(orgId, userId)
        const confluenceViewCreator = createConfluenceAuthModal()
        let confluenceView = confluenceViewCreator.setDomainView()

        if (confluenceAuthList && confluenceAuthList.length > 0) {
            const firstSite = confluenceAuthList[0]
            const {accessToken} = await getAccessTokenFromRefreshToken({ orgId, userId, confluenceAuth: firstSite, createNewSession: true })
            const cfInfo = await getSaveConfluenceViewData(accessToken)
            
            if (cfInfo) {
                const messageShortcut = shortcut as MessageShortcut
                const messageLink = await getPermalinkWithTimeout(client, messageShortcut.channel.id, messageShortcut.message_ts)
                confluenceView = confluenceViewCreator.saveToConfluencePageModal({ confluenceSiteUrl: firstSite.siteUrl, pages: cfInfo.pages, messageLink: messageLink || '' })
            }

        }

        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: confluenceView
        })
    })
}

const setDomainHandler = (app: App) => {
    return app.action(confluenceDomainActionId, async ({ ack, body, client }) => {
        const confluenceAuthView = createConfluenceAuthModal()
        const payload = body as BlockAction
        const userId = payload.user.id;
        const orgId = payload.team?.id;
        const viewHash = payload.view?.hash;
        const viewId = payload.view?.id;
        const action = payload.actions[0] as PlainTextInputAction;
        const value = action.value;

        if (!orgId || !userId || !value || !viewHash || !viewId) {
            throw new Error('Missing orgId, userId, value or viewHash')
        }

        const confluenceSiteUrl = value
        const authorizeUrl = getAuthorizeUrl(orgId, userId, confluenceSiteUrl)

        const setAuthViewModal = confluenceAuthView.appendLinkButton(authorizeUrl, confluenceSiteUrl, viewId, viewHash)

        await client.views.update(setAuthViewModal)
    }
    )
}

export const registerConfluenceHandlers = (app: App) => {
    saveConfluenceShortcutHandler(app)
    setDomainHandler(app)
}

