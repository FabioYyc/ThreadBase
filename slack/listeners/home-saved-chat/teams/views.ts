import { PlainTextOption, SectionBlock, View } from "@slack/bolt"
import { ISavedTeam } from "../../../../common/modules/team"
import { personalSpaceValue, editTeamCallbackId, createTeamCallbackId, teamSwitchActionId } from "./constants";
import { Team } from "./types";






export const generateTeamView = ({
    teamId,
    team,
    isEdit = false
}: { teamId?: string, team?: Team, isEdit?: boolean }): View => (
    {
        "type": "modal",
        callback_id: isEdit ? editTeamCallbackId : createTeamCallbackId,
        external_id: teamId,
        "submit": {
            "type": "plain_text",
            "text": "Submit",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "title": {
            "type": "plain_text",
            "text": isEdit ? "Edit :writing_hand:" : "Create a new team :tada:",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": isEdit ? "Edit your team details :construction_worker:" : "Create a new team to share your saved chats with your teammates! :construction_worker:",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                block_id: 'team_name',
                "label": {
                    "type": "plain_text",
                    "text": "Team Name",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": false,
                    "initial_value": isEdit ? team?.teamName : undefined
                }
            },
            {
                "type": "input",
                block_id: 'team_description',
                "label": {
                    "type": "plain_text",
                    "text": "Team Description",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "initial_value": isEdit ? team?.teamDescriptions : undefined
                },
                "optional": true
            },
            {
                "type": "input",
                block_id: 'team_members',
                "element": {
                    "type": "multi_users_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select users",
                        "emoji": true
                    },
                    "initial_users": (isEdit && team?.teamUsers) ? team.teamUsers : [],
                    "action_id": "multi_users_select-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Add members",
                    "emoji": true
                },
                optional: true
            },
            {
                "type": "input",
                block_id: 'team_conversations',
                "element": {
                    "type": "multi_conversations_select",
                    "action_id": "multi_conversations_select-action",
                    'initial_conversations': (isEdit && team?.teamConversations) ? team.teamConversations.map(teamConversation => teamConversation.conversationId) : undefined,
                    max_selected_items: 3
                },
                "label": {
                    "type": "plain_text",
                    "text": "Add Channel Users",
                    "emoji": true
                },
                optional: true
            },
        ]
    }
)



export const teamSelector = (teams: ISavedTeam[], selectedTeamId?: string) => {
    let selectedTeam;
    if (selectedTeamId) {
        selectedTeam = teams.find(team => team.id === selectedTeamId)
    }
    const getTeamOption = (team: ISavedTeam): PlainTextOption => {
        return {
            "text": {
                "type": "plain_text",
                "text": `:people_holding_hands:${team.teamName}`,
                "emoji": true
            },
            "value": team.id
        }
    }

    const teamOptions = teams.map(getTeamOption)
    const personalSpaceOption: PlainTextOption = {
        "text": {
            "type": "plain_text",
            "text": ":bust_in_silhouette:Personal Space",
            "emoji": true
        },
        "value": personalSpaceValue
    }
    teamOptions.unshift(personalSpaceOption)


    const spaceText = selectedTeam ? `*Current Team Space: ${selectedTeam.teamName}*` : `*Currently At Personal Space*`
    const returnBlock: SectionBlock = {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": spaceText
        }
    }

    if (teamOptions.length >= 1) {
        returnBlock.accessory = {
            "type": "static_select",
            "action_id": teamSwitchActionId,
            "placeholder": {
                "type": "plain_text",
                "text": "Select team",
                "emoji": true
            },
            "options": teamOptions,
            "initial_option": selectedTeam ? getTeamOption(selectedTeam) : personalSpaceOption
        }
    }

    return returnBlock
}