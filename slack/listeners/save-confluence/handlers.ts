import { App } from "@slack/bolt"
import { confluenceAuthView } from "./view"

const saveConfluenceShortcutHandler = (app: App) => {
    return app.shortcut('create-confluence', async ({ shortcut, ack, client }) => {
        ack()
        const authView = await confluenceAuthView()
        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: authView
        })
    })
}

export const registerConfluenceHandlers = (app: App) => {
    saveConfluenceShortcutHandler(app)
}