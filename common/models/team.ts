import mongoose, { ClientSession, Document } from "mongoose";

export interface ITeamConversation {
  conversationId: string;
  members: string[];
}
export interface ITeam {
  ownerId: string;
  teamName: string;
  teamDescriptions: string;
  teamUsers: string[];
  teamConversations?: ITeamConversation[];
  orgId: string;
  isArchived?: boolean;
}

const TeamSchema = new mongoose.Schema({
  ownerId: String,
  teamName: String,
  teamDescriptions: String,
  teamUsers: Array,
  teamConversations: Array,
  orgId: String,
  isArchived: Boolean,
});

const Team = mongoose.model("Team", TeamSchema);

export interface ISavedTeam extends Document, ITeam {}

export const teamRepo = {

  create: async (team: ITeam, session: ClientSession) => {
    const newTeam = new Team(team);
    return await newTeam.save({ session });
  },
  updateTeam: async (teamId: string, team: ITeam, session: ClientSession) => {
    return await Team.updateOne(
      { _id: new mongoose.Types.ObjectId(teamId) },
      { $set: team },
      { session },
    );
  },
  getTeamById: async (teamId: string): Promise<ISavedTeam> => {
    return (await Team.findOne({ _id: new mongoose.Types.ObjectId(teamId), $or: [{ "isArchived": false }, { "isArchived": { $exists: false } }] })) as ISavedTeam;
  },

  getTeamsByIds: async (teamIds: string[]): Promise<ISavedTeam[]> => {
    return (await Team.find({ _id: { $in: teamIds }, $or: [{ "isArchived": false }, { "isArchived": { $exists: false } }]})) as ISavedTeam[];
  },

  findTeamsWhereUserIsChannelMember: async (
    orgId: string,
    userId: string,
  ): Promise<ISavedTeam[]> => {
    return (await Team.find({
      orgId,
      teamConversations: { $elemMatch: { members: userId } },
      $or: [{ "isArchived": false }, { "isArchived": { $exists: false } }],
    })) as ISavedTeam[];
  },

  archiveTeam: async (teamId: string) => {
    return await Team.updateOne(
      { _id: new mongoose.Types.ObjectId(teamId) },
      { $set: { isArchived: true } },
    );
  }
};
