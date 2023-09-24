import { PlainTextOption, SectionBlock, View } from "@slack/bolt";
import { ISavedTeam } from "../../../../common/models/team";
import {
  personalSpaceValue,
  editTeamCallbackId,
  createTeamCallbackId,
  teamSwitchActionId,
  deleteTeamConfirmButtonActionId,
  deleteTeamButtonActionId,
} from "./constants";
import { Team } from "./types";

export const generateTeamView = ({
  teamId,
  team,
  isEdit = false,
}: {
  teamId?: string;
  team?: Team;
  isEdit?: boolean;
}): View => {
  return {
    type: "modal",
    callback_id: isEdit ? editTeamCallbackId : createTeamCallbackId,
    external_id: teamId,
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    title: {
      type: "plain_text",
      text: isEdit ? "Edit :writing_hand:" : "Create a new folder :tada:",
      emoji: true,
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: isEdit
            ? "Edit your folder details :construction_worker:"
            : "Create a new folder to share your saved chats with your teammates! :construction_worker:",
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "input",
        block_id: "team_name",
        label: {
          type: "plain_text",
          text: "Folder Name",
          emoji: true,
        },
        element: {
          type: "plain_text_input",
          multiline: false,
          initial_value: isEdit ? team?.teamName : undefined,
        },
      },
      {
        type: "input",
        block_id: "team_description",
        label: {
          type: "plain_text",
          text: "Folder Description",
          emoji: true,
        },
        element: {
          type: "plain_text_input",
          multiline: true,
          initial_value: isEdit ? team?.teamDescriptions : undefined,
        },
        optional: true,
      },
      {
        type: "input",
        block_id: "team_members",
        element: {
          type: "multi_users_select",
          placeholder: {
            type: "plain_text",
            text: "Select users to add to folder",
            emoji: true,
          },
          initial_users: isEdit && team?.teamUsers ? team.teamUsers : [],
          action_id: "multi_users_select-action",
        },
        label: {
          type: "plain_text",
          text: "Folder Members",
          emoji: true,
        },
        optional: true,
      },
      {
        type: "input",
        block_id: "team_conversations",
        element: {
          type: "multi_conversations_select",
          action_id: "multi_conversations_select-action",
          initial_conversations:
            isEdit && team?.teamConversations
              ? team.teamConversations.map((teamConversation) => teamConversation.conversationId)
              : undefined,
          max_selected_items: 3,
        },
        label: {
          type: "plain_text",
          text: "Add Channel Users",
          emoji: true,
        },
        optional: true,
      },
      { type: "divider" },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Delete Folder",
              emoji: true,
            },
            value: "click_me_123",
            action_id: deleteTeamButtonActionId,
            style: "danger",
          },
        ],
      },
    ],
  };
};

export const teamSelector = (teams: ISavedTeam[], selectedTeamId?: string) => {
  let selectedTeam;
  if (selectedTeamId) {
    selectedTeam = teams.find((team) => team.id === selectedTeamId);
  }
  const getTeamOption = (team: ISavedTeam): PlainTextOption => {
    return {
      text: {
        type: "plain_text",
        text: `:file_folder:${team.teamName}`,
        emoji: true,
      },
      value: team.id,
    };
  };

  const teamOptions = teams.map(getTeamOption);
  const personalSpaceOption: PlainTextOption = {
    text: {
      type: "plain_text",
      text: ":bust_in_silhouette:Personal Space",
      emoji: true,
    },
    value: personalSpaceValue,
  };
  teamOptions.unshift(personalSpaceOption);

  const spaceText = selectedTeam
    ? `*Current Folder: ${selectedTeam.teamName}*`
    : `*Currently At Personal Space*`;
  const returnBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: spaceText,
    },
  };

  if (teamOptions.length >= 1) {
    returnBlock.accessory = {
      type: "static_select",
      action_id: teamSwitchActionId,
      placeholder: {
        type: "plain_text",
        text: "Select folder",
        emoji: true,
      },
      options: teamOptions,
      initial_option: selectedTeam ? getTeamOption(selectedTeam) : personalSpaceOption,
    };
  }

  return returnBlock;
};

export const deleteTeamConfirmView = (teamId: string, teamName: string): View => ({
  type: "modal",
  callback_id: deleteTeamConfirmButtonActionId,
  external_id: teamId,
  submit: {
    type: "plain_text",
    text: "Confirm",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  title: {
    type: "plain_text",
    text: "Delete this folder :broom:",
    emoji: true,
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Confirm you want to *DELETE* folder: *${teamName}*`,
      },
    },
  ],
});
