import { App, BlockAction, PlainTextInputAction } from "@slack/bolt"
import { getAuthorizeUrl } from "../../../common/utils/auth-url-utils"
import { createConfluenceAuthModal } from "./view"
import { confluenceDomainActionId } from "./constants"
import { getSaveConfluenceViewData, getUserConfluenceAuth } from "./utils"

const saveConfluenceShortcutHandler = async (app: App) => {
    return app.shortcut('create-confluence', async ({ shortcut, ack, client, context }) => {
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
            //TODO: request to confluence to get the space list
                const cfInfo = await getSaveConfluenceViewData({ orgId, userId, confluenceAuth: firstSite })
                if (cfInfo) {
                    //TODO: get permalink of the message
                    confluenceView = confluenceViewCreator.saveToConfluencePageModal({confluenceSiteUrl: firstSite.siteUrl, pages: cfInfo.pages} )
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

