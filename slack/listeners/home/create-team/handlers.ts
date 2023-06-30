import { App } from "@slack/bolt";
import { createTeamActionId, createTeamView } from "./views";

const initialiseTeamHandlers = (app: App): void => {
    app.action(createTeamActionId, async ({ ack, body, client }) => {
        try {
            ack();
            const payload = body as any;
            app.client.views.open({
                trigger_id: payload.trigger_id,
                view: createTeamView({})
        })
        } catch (error) {
            throw new Error(`error in create team: ${error}`)
        }
     
})
}

const saveTeamHandler = (app: App) => {
}

export const registerCreateTeamHandlers = (app: App): void => {
    initialiseTeamHandlers(app);
}