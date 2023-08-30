import { App, SlackViewAction, ViewOutput } from "@slack/bolt";
import { ISavedTeam, ITeam, ITeamConversation, teamRepo } from "../../../../common/models/team";
import { stringInputParser } from "../../../utils";
import { ITeamFormValues } from "./types";
import { ClientSession } from "mongoose";
import { createTeamConversations } from "./conversations";
import { UserRepo, UserRole } from "../../../../common/models/user";

export const getAddedMembers = (oldMembers: string[], newMembers: string[]): string[] => {
  return newMembers.filter((member) => !oldMembers.includes(member));
};

export const getRemovedMembers = (oldMembers: string[], newMembers: string[]): string[] => {
  return oldMembers.filter((member) => !newMembers.includes(member));
};

export const processTeamForm = async ({
  app,
  values,
  body,
  view,
}: {
  app: App;
  values: ITeamFormValues;
  body: SlackViewAction;
  view: ViewOutput;
}) => {
  const { team_name, team_description } = values;
  const teamUsers = values.team_members.selected_users;
  const orgId = view.team_id;

  if (!team_name) {
    throw new Error("team name is not provided");
  }

  const conversations = values.team_conversations.selected_conversations;

  const teamConversations: ITeamConversation[] = [];

  for (const conversation of conversations) {
    const teamConversation = await createTeamConversations(app, conversation);
    teamConversations.push(teamConversation);
  }

  const team: ITeam = {
    teamName: stringInputParser(team_name),
    teamDescriptions: stringInputParser(team_description),
    orgId: orgId,
    ownerId: body.user.id,
    teamUsers: teamUsers,
    teamConversations: teamConversations,
  };
  return team;
};

export const addTeamToUserTeam = async ({
  orgId,
  userId,
  teamId,
  userRole,
  session,
}: {
  orgId: string;
  userId: string;
  teamId: string;
  userRole: UserRole;
  session: ClientSession;
}) => {
  //find if user team exists, if not create with current teamId
  //if exists, add current teamId to teams array
  const userRepo = UserRepo(session);
  const userTeams = await userRepo.findByUserId({ orgId, userId: userId });
  if (!userTeams) {
    const newUserTeams = {
      orgId,
      userId: userId,
      teams: [
        {
          teamId: teamId,
          userRole: userRole,
        },
      ],
    };
    await userRepo.create(newUserTeams);
  } else {
    await userRepo.addTeamToUser({ orgId, userId, team: { teamId, userRole } });
  }
};

export const getTeamsForUser = async (orgId: string, userId: string): Promise<ISavedTeam[]> => {
  const userRepo = UserRepo();
  const userTeams = await userRepo.findByUserId({ orgId, userId: userId });
  if (!userTeams) {
    return [];
  }
  const teams = userTeams.teams;
  const channelTeams = await teamRepo.findTeamsWhereUserIsChannelMember(orgId, userId);
  const teamIds = teams.map((team) => team.teamId);
  if (channelTeams) {
    teamIds.push(...channelTeams.map((team) => team.id));
  }
  return (await teamRepo.getTeamsByIds(teamIds)) || [];
};

export const checkIfUserIsTeamOwner = async ({
  userId,
  teamId,
  orgId,
}: {
  userId: string;
  orgId: string;
  teamId: string;
}) => {
  const userRepo = UserRepo();
  const userTeams = await userRepo.findByUserId({ orgId, userId: userId });
  if (!userTeams) {
    return false;
  }
  const teams = userTeams.teams;
  const team = teams.find((team) => team.teamId === teamId);
  if (!team) {
    return false;
  }
  return team.userRole === UserRole.Owner;
};
