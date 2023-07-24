import { SlackViewAction, ViewOutput } from "@slack/bolt";
import { ISavedTeam, ITeam, UserRole, teamRepo, userTeamsRepo } from "../../../module/team";
import { stringInputParser } from "../../../utils";
import { ITeamFormValues } from "./types";
import { ClientSession } from "mongoose";

export const getAddedMembers = (oldMembers: string[], newMembers: string[]): string[] => {
    return newMembers.filter(member => !oldMembers.includes(member));
}

export const getRemovedMembers = (oldMembers: string[], newMembers: string[]): string[] => {
    return oldMembers.filter(member => !newMembers.includes(member));
}

export const processTeamForm = (values: ITeamFormValues, body: SlackViewAction, view: ViewOutput) => {
    const { team_name, team_description } = values;
    const teamUsers = values.team_members.selected_users;
    const orgId = view.team_id;

    if(!team_name){
        throw new Error('team name is not provided');
    }

    const team: ITeam = {
        teamName: stringInputParser(team_name),
        teamDescriptions: stringInputParser(team_description),
        orgId: orgId,
        ownerId: body.user.id,
        teamUsers: teamUsers,
    }
    return team;
};


export const addTeamToUserTeam = async ({orgId, userId, teamId, userRole, session}:{orgId:string, userId: string, teamId: string, userRole: UserRole, session:ClientSession}) => {

    //find if user team exists, if not create with current teamId
    //if exists, add current teamId to teams array

    const userTeams = await userTeamsRepo.findByUserId({orgId, userId: userId});
    if(!userTeams) {
        const newUserTeams = {
            orgId,
            userId: userId,
            teams: [{
                teamId: teamId,
                userRole: userRole
            }]
        }
        await userTeamsRepo.create(newUserTeams, session);
    }
    else {
        await userTeamsRepo.addTeamToUser({orgId, userId, team: {teamId, userRole}, session});
    }

}

export const getTeamsForUser = async (orgId:string, userId: string): Promise<ISavedTeam[]> => {
    const userTeams = await userTeamsRepo.findByUserId({orgId, userId: userId});
    if(!userTeams) {
        return [];
    }
    const teams = userTeams.teams;
    const teamIds = teams.map(team => team.teamId);
    return await teamRepo.getTeamsByIds(teamIds) || [];
}

export const checkIfUserIsTeamOwner = async ({userId, teamId, orgId}:{userId: string, orgId:string, teamId: string}) => {
    const userTeams = await userTeamsRepo.findByUserId({orgId, userId: userId});
    if(!userTeams) {
        return false;
    }
    const teams = userTeams.teams;
    const team = teams.find(team => team.teamId === teamId);
    if(!team) {
        return false;
    }
    return team.userRole === UserRole.Owner;
}