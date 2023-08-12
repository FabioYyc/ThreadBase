import { App } from "@slack/bolt"
import { confluenceAuthView } from "./view"
import { getAuthorizeUrl } from "./utils"

const saveConfluenceShortcutHandler = (app: App) => {
    return app.shortcut('create-confluence', async ({ shortcut, ack, client }) => {
        ack()
        const { team, user } = shortcut
        const orgId = team?.id
        const userId = user?.id
        // need to store userId and orgId in the database with auth
        // change redirect to slack
        const authorizeUrl = getAuthorizeUrl(orgId as string, userId as string)
        const authView = await confluenceAuthView(authorizeUrl)
        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: authView
        }) 
    })
}

export const registerConfluenceHandlers = (app: App) => {
    saveConfluenceShortcutHandler(app)
}