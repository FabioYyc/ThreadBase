import mongoose, { ClientSession, Document } from "mongoose";

export interface ITeam{
    ownerId: string;
    teamName: string;
    teamDescriptions: string;
    teamUsers: string[];
    orgId: string;
}

const TeamSchema = new mongoose.Schema({
    ownerId: String,
    teamName: String,
    teamDescriptions: String,
    teamUsers: Array,
    orgId: String,
});

const userTeamsSchema = new mongoose.Schema({
    userId: String,
    teams: Array
})

export interface IUserTeams{
    userId: string;
    teams: {
        teamId: string;
        userRole: string;
    }[]
}

export enum UserRole {
    Member = 'member',
    Owner = 'owner'
}


const Team = mongoose.model("Team", TeamSchema);

const UserTeams = mongoose.model("UserTeams", userTeamsSchema);


export interface ISavedTeam extends Document, ITeam {}


export const teamRepo = {
    create: async (team: ITeam, session: ClientSession) => {
        const newTeam = new Team(team);
        return await newTeam.save({ session });
    },
    updateTeam: async (teamId: string, team: ITeam, session: ClientSession) => {
        await Team.updateOne({ _id: new mongoose.Types.ObjectId(teamId) }, { $set: team }, { session });
    }
}

export const userTeamsRepo = {
    create: async (userTeams: IUserTeams, session:ClientSession) => {
        const newUserTeams = new UserTeams(userTeams);
        return await newUserTeams.save({session});
    },
    updateTeams: async (userId: string, teams: string[], session:ClientSession) => {
        await UserTeams.updateOne({ userId: userId }, { $set: {teams: teams} }, { session });
    }
}

export const addTeamToUserTeam = async ({userId, teamId, userRole, session}:{userId: string, teamId: string, userRole: UserRole, session:ClientSession}) => {

    //find if user team exists, if not create with current teamId
    //if exists, add current teamId to teams array

    const userTeams = await UserTeams.findOne({userId: userId});
    if(!userTeams) {
        const newUserTeams = {
            userId: userId,
            teams: [{
                teamId: teamId,
                userRole: userRole
            }]
        }
        await userTeamsRepo.create(newUserTeams, session);
    }
    else {
        const teams = userTeams.teams;
        teams.push({
            teamId: teamId,
            userRole: userRole
        })
        await userTeamsRepo.updateTeams(userId, teams, session);
    }

}

export const getTeamsForUser = async (userId: string): Promise<ISavedTeam[]> => {
    const userTeams = await UserTeams.findOne({userId: userId});
    if(!userTeams) {
        return [];
    }
    const teams = userTeams.teams;
    const teamIds = teams.map(team => team.teamId);
    return await Team.find({_id: {$in: teamIds}}) || [];
}