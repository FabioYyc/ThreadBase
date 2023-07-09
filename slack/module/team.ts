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
    orgId: String,
    teams: Array
})

export interface IUserTeams{
    userId: string;
    orgId: string;
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

export interface ISavedUserTeams extends Document, IUserTeams {}


export const teamRepo = {
    create: async (team: ITeam, session: ClientSession) => {
        const newTeam = new Team(team);
        return await newTeam.save({ session });
    },
    updateTeam: async (teamId: string, team: ITeam, session: ClientSession) => {
        return await Team.updateOne({ _id: new mongoose.Types.ObjectId(teamId) }, { $set: team }, { session });
    },
    getTeamById: async (teamId: string): Promise<ISavedTeam> => {
        return await Team.findOne({ _id: new mongoose.Types.ObjectId(teamId) }) as ISavedTeam;
    },

    getTeamsByIds: async (teamIds: string[]): Promise<ISavedTeam[]> => {
        return await Team.find({ _id: { $in: teamIds } }) as ISavedTeam[];
    },

}

export const userTeamsRepo = {
    findById: async ({userId, orgId}:{userId: string, orgId: string}): Promise<ISavedUserTeams | null> => {
        const userTeams = await UserTeams.findOne({ userId: userId, orgId: orgId });
        return userTeams as ISavedUserTeams;
    },

    create: async (userTeams: IUserTeams, session:ClientSession) => {
        const newUserTeams = new UserTeams(userTeams);
        return await newUserTeams.save({session});
    },
    addTeamToUser: async ({userId, team, session, orgId}:{userId: string, orgId:string, team: {teamId: string, userRole: string}, session:ClientSession}) => {
        await UserTeams.updateOne({ userId: userId, orgId }, { $push: {teams: team} }, { session });
    },
    removeTeamFromUser: async ({userId, teamId, session, orgId}:{userId: string, orgId:string, teamId: string, session:ClientSession}) => {
        await UserTeams.updateOne({ userId: userId, orgId }, { $pull: {teams: {teamId: teamId}} }, { session });
    },
}



