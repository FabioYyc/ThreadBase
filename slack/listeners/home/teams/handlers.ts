import { App, ViewSubmitAction } from "@slack/bolt";
import { createTeamActionId, createTeamCallbackId, createTeamView, personalSpaceValue, teamSwitchActionId } from "./views";
import { stringInputParser, viewInputReader } from "../../../utils";
import { ITeam, UserRole, addTeamToUserTeam, teamRepo } from "../../../module/team";
import { connection } from "mongoose";
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
            await addTeamToUserTeam({orgId, userId: body.user.id, teamId:newTeam.id, userRole: UserRole.Owner, session})
            const addTeamPromises = teamUsers.map(async (teamUser:string) => {
                await addTeamToUserTeam({ orgId, userId: teamUser, teamId: newTeam.id, userRole: UserRole.Member, session });
              });
            await Promise.all(addTeamPromises);
            await session.commitTransaction();
            await getUserHomeView(orgId, body.user.id, client, newTeam.id);

        } catch (error) {
            console.error(error);
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
        const orgId = payload.team.id;

        console.log('payload', payload)
        if(selectedTeamValue === personalSpaceValue){
            getUserHomeView(orgId, userId, client, personalSpaceValue);
            await updateUserUILatestTeamId(orgId, userId, personalSpaceValue);
            return;
        }
        const selectedTeam = await teamRepo.getTeamById(selectedTeamValue);
        //update home tab view
        await updateUserUILatestTeamId(orgId, userId, selectedTeam.id);
        getUserHomeView(orgId, payload.user.id, client, selectedTeam.id);
    })
}



export const registerCreateTeamHandlers = (app: App): void => {
    initialiseTeamHandlers(app);
    saveTeamHandler(app);
    switchTeamHandler(app);
}