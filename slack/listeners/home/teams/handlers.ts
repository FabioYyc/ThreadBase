import { App, SlackViewAction, ViewSubmitAction } from "@slack/bolt";
import { createTeamActionId, createTeamCallbackId, createTeamView, personalSpaceValue, teamSwitchActionId } from "./views";
import { stringInputParser, viewInputReader } from "../../../utils";
import { ITeam, IUserTeams, UserRole, addTeamToUserTeam, teamRepo, userTeamsRepo } from "../../../module/team";
import mongoose, { connection } from "mongoose";
import { getUserHomeView } from "../home-tab-view";
import { updateUserUILatestTeamId } from "../../../module/userUI";

const initialiseTeamHandlers = (app: App): void => {
    app.action(createTeamActionId, async ({ ack, body, client }) => {
        try {
            ack();
            const payload = body as any;
            client.views.open({
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
            teamUsers: teamUsers,
        }
        const session = await connection.startSession();    
        //create team and teamUsers in a transaction
        session.startTransaction();
        try {
            const newTeam = await teamRepo.create(team, session);
            await addTeamToUserTeam({userId: body.user.id, teamId:newTeam.id, userRole: UserRole.Owner, session})
            for (const teamUser of teamUsers) {
                await addTeamToUserTeam({userId: teamUser, teamId:newTeam.id, userRole: UserRole.Member, session})
            }
            await session.commitTransaction();
            await getUserHomeView(body.user.id, client, newTeam.id);
        } catch (error) {
            await session.abortTransaction();
            throw new Error(`error in create team: ${error}`)
        }
        session.endSession();

    })
}

export const switchTeamHandler = (app: App) => {
    app.action(teamSwitchActionId, async ({ ack, body, client }) => {
        //find the team
        ack();
        const payload = body as any;
        const selectedTeamValue = payload.actions[0].selected_option.value;
        const userId = payload.user.id;
        if(selectedTeamValue === personalSpaceValue){
            getUserHomeView(userId, client, personalSpaceValue);
            await updateUserUILatestTeamId(userId, personalSpaceValue);
            return;
        }
        const selectedTeam = await teamRepo.getTeamById(selectedTeamValue);
        //update home tab view
        await updateUserUILatestTeamId(userId, selectedTeam.id);
        getUserHomeView(payload.user.id, client, selectedTeam.id);
    })
}



export const registerCreateTeamHandlers = (app: App): void => {
    initialiseTeamHandlers(app);
    saveTeamHandler(app);
    switchTeamHandler(app);
}