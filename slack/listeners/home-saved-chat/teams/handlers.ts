import { App, BlockAction, ButtonAction } from "@slack/bolt";
import { deleteTeamConfirmView, generateTeamView } from "./views";
import { stringInputParser, viewInputReader } from "../../../utils";
import { teamRepo } from "../../../../common/models/team";
import { connection } from "mongoose";
import { getUserHomeView } from "../home-tab-view";
import { addTeamToUserTeam, checkIfUserIsTeamOwner, processTeamForm } from "./utils";
import _ from "lodash";
import {
  createTeamButtonActionId,
  createTeamCallbackId,
  deleteTeamButtonActionId,
  deleteTeamConfirmButtonActionId,
  editTeamButtonActionId,
  editTeamCallbackId,
  personalSpaceValue,
  teamSwitchActionId,
} from "./constants";
import { ITeamFormValues } from "./types";
import { UserRepo, UserRole, updateUserUILatestTeamId } from "../../../../common/models/user";

const createTeamButtonHandler = (app: App): void => {
  app.action(createTeamButtonActionId, async ({ ack, body, client }) => {
    try {
      ack();
      const payload = body as BlockAction;
      client.views.open({
        trigger_id: payload.trigger_id,
        view: generateTeamView({}),
      });
    } catch (error) {
      throw new Error(`error in create team: ${error}`);
    }
  });
};

const editTeamButtonHandler = (app: App): void => {
  app.action(editTeamButtonActionId, async ({ ack, body, client }) => {
    try {
      ack();
      const payload = body as BlockAction;
      const actions = payload.actions as ButtonAction[];
      //get value of the action
      const selectedTeamValue = actions[0].value;
      //get team
      const team = await teamRepo.getTeamById(selectedTeamValue);
      const isOwner = await checkIfUserIsTeamOwner({
        orgId: team.orgId,
        userId: body.user.id,
        teamId: team.id,
      });
      if (!isOwner) {
        return;
      }
      client.views
        .open({
          trigger_id: payload.trigger_id,
          view: generateTeamView({ teamId: `edit_team-${selectedTeamValue}`, team, isEdit: true }),
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      throw new Error(`error in create team: ${error}`);
    }
  });
};

const createTeamFormHandler = (app: App) => {
  app.view(createTeamCallbackId, async ({ ack, body, view, client }) => {
    ack();
    const session = await connection.startSession();
    session.startTransaction();
    const values = viewInputReader(view) as ITeamFormValues;
    const team = await processTeamForm({ app, values, body, view });

    try {
      const newTeam = await teamRepo.create(team, session);
      const userId = body.user.id;
      const orgId = team.orgId;
      await addTeamToUserTeam({
        orgId: team.orgId,
        userId: body.user.id,
        teamId: newTeam.id,
        userRole: UserRole.Owner,
        session,
      });
      const addTeamPromises = team.teamUsers.map(async (teamUser: string) => {
        await addTeamToUserTeam({
          orgId: team.orgId,
          userId: teamUser,
          teamId: newTeam.id,
          userRole: UserRole.Member,
          session,
        });
      });
      await Promise.all(addTeamPromises);
      await session.commitTransaction();
      await updateUserUILatestTeamId(orgId, userId, newTeam.id);
      await getUserHomeView(team.orgId, body.user.id, client, newTeam.id);
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      throw new Error(`error in create team: ${error}`);
    } finally {
      session.endSession();
    }
  });
};

const editTeamFormHandler = (app: App) => {
  app.view(editTeamCallbackId, async ({ ack, body, view, client }) => {
    ack();
    const session = await connection.startSession();
    const values = viewInputReader(view) as ITeamFormValues;
    const team = await processTeamForm({ app, values, body, view });
    const userRepo = UserRepo(session);

    try {
      const externalId = body.view.external_id;
      if (!externalId) {
        throw new Error("team id is not provided");
      }
      const teamId = externalId.split("-")[1];
      const oldTeam = await teamRepo.getTeamById(teamId);
      if (!oldTeam) {
        throw new Error("team is not found");
      }

      session.startTransaction();

      await teamRepo.updateTeam(teamId, team, session);

      const addedMembers = _.difference(team.teamUsers, oldTeam.teamUsers);
      const removedMembers = _.difference(oldTeam.teamUsers, team.teamUsers);

      // If there are new members added, add the team to their userTeams
      if (addedMembers.length > 0) {
        for (const memberId of addedMembers) {
          await userRepo.addTeamToUser({
            userId: memberId,
            orgId: team.orgId,
            team: { teamId, userRole: UserRole.Member },
          });
        }
      }

      // If there are members removed, remove the team from their userTeams
      if (removedMembers.length > 0) {
        for (const memberId of removedMembers) {
          await userRepo.removeTeamFromUser({
            userId: memberId,
            orgId: team.orgId,
            teamId,
          });
        }
      }

      await session.commitTransaction();
      await getUserHomeView(team.orgId, body.user.id, client, teamId);
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      throw new Error(`error in edit team: ${error}`);
    } finally {
      session.endSession();
    }
  });
};

const switchTeamHandler = (app: App) => {
  app.action(teamSwitchActionId, async ({ ack, body, client }) => {
    //find the team
    ack();
    const payload = body as any;
    const selectedTeamValue = payload.actions[0].selected_option.value;
    const userId = payload.user.id;
    const orgId = payload.team.id;

    if (selectedTeamValue === personalSpaceValue) {
      getUserHomeView(orgId, userId, client, personalSpaceValue);
      await updateUserUILatestTeamId(orgId, userId, personalSpaceValue);
      return;
    }
    const selectedTeam = await teamRepo.getTeamById(selectedTeamValue);
    //update home tab view
    await updateUserUILatestTeamId(orgId, userId, selectedTeam.id);
    getUserHomeView(orgId, payload.user.id, client, selectedTeam.id);
  });
};

const deleteTeamHandler =(app: App) => {
  app.action(deleteTeamButtonActionId, async ({ ack, body, client, payload }) => {
    try {
      ack();
      const payload = body as BlockAction;
      const externalId = payload.view?.external_id;
      const teamId = externalId?.split("-")[1];
      const view = payload.view;
      if(!view || !externalId || !teamId) {
        console.log({
          teamId,
          externalId,
        })
        throw new Error("Missing view or external id or team id");
      }
      const value = viewInputReader(view) as ITeamFormValues;

      const teamName = stringInputParser(value.team_name);

      client.views.update({
        view_id: payload.view?.id,
        viewHash: payload.view?.hash,
        view: deleteTeamConfirmView(teamId, teamName),
      });
    } catch (error) {
      throw new Error(`error in delete team: ${error}`);
    }
  });
}

const deleteTeamConfirmHandler = (app: App) => {
  app.view(deleteTeamConfirmButtonActionId, async ({ ack, body, view, client }) => {
    try {
      await ack();
      const external_id = view.external_id;
      const orgId = view.team_id;
      const userId = body.user.id;
      if (!external_id) {
        throw new Error("Missing external id");
      }
      await teamRepo.archiveTeam(external_id);
      await getUserHomeView(orgId, userId, client, personalSpaceValue);
    } catch (error) {
      throw new Error(`error in delete team: ${error}`);
    }
  });
};


export const registerCreateTeamHandlers = (app: App): void => {
  createTeamButtonHandler(app);
  editTeamButtonHandler(app);
  createTeamFormHandler(app);
  editTeamFormHandler(app);
  switchTeamHandler(app);
  deleteTeamHandler(app)
  deleteTeamConfirmHandler(app);
};
