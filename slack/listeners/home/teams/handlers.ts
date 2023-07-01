import { App, SlackViewAction, ViewSubmitAction } from "@slack/bolt";
import { createTeamActionId, createTeamCallbackId, createTeamView } from "./views";
import { stringInputParser, viewInputReader } from "../../../utils";
import { ITeam, IUserTeams, UserRole, addTeamToUserTeam, teamRepo, userTeamsRepo } from "../../../module/team";
import { connection } from "mongoose";

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
    app.view(createTeamCallbackId, async ({ ack, body, view, client }) => {
        //TODO: create team repo, save team
        ack()
        const payload = body as ViewSubmitAction;
        const values = viewInputReader(view);
        const { team_name, team_description } = values;
        const teamUsers = values.team_members.selected_users;
        const orgId = view.team_id;
        const team: ITeam = {
            teamName: stringInputParser(team_name),
            teamDescriptions: stringInputParser(team_description),
            orgId: orgId,
            ownerId: body.user.id,
            teamUsers: teamUsers
        }
        const session = await connection.startSession();    
        //create team and teamUsers in a transaction
        session.startTransaction();
        try {
            const newTeam = await teamRepo.create(team, session);
            for (const teamUser of teamUsers) {
                await addTeamToUserTeam({userId: teamUser, teamId:newTeam.id, userRole: UserRole.Member, session})
            }
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new Error(`error in create team: ${error}`)
        }
        session.endSession();

    })
}

export const registerCreateTeamHandlers = (app: App): void => {
    initialiseTeamHandlers(app);
    saveTeamHandler(app);
}