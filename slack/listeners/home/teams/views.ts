import { View } from "@slack/bolt"
import { ISavedTeam, ITeam } from "../../../module/team"

export const createTeamActionId = 'create_team'
export const homeTabActionRow = () =>(
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Create New Team",
                    "emoji": true
                },
                "style": "primary",
                "value": "create_team",
                "action_id": createTeamActionId
            },
        ]
})

export const createTeamModalCallBackId = 'create-team-modal-callback'

export const createTeamCallbackId = 'create-team-callback'
export const editTeamCallbackId = 'edit-team-callback'

export const createTeamView = ({teamId, isEdit = false, }:{teamId?: string, isEdit? : boolean}): View => (
    {
        "type": "modal",
        callback_id: isEdit? editTeamCallbackId : createTeamCallbackId,
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
            "text": "Create a new team :tada:",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Create a new team to share your saved chats with your teammates! :construction_worker:",
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
                    "action_id": "multi_users_select-action"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Add members",
                    "emoji": true
                }
            }
        ]
    }
)

export const teamSelector = (teams: ISavedTeam[]) => {
    const firstTeam = teams[0]
    const getTeamOption = (team:ISavedTeam) =>{
        return {
            "text": {
                "type": "plain_text",
                "text": team.teamName,
                "emoji": true
            },
            "value": team.id
        }
    }

    const teamOptions = teams.map(getTeamOption)

    return {
    "type": "section",
    "text": {
        "type": "mrkdwn",
        "text": `*Team: ${firstTeam.teamName}*`
    },
    "accessory": {
        "type": "static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select team",
            "emoji": true
        },
        "options": teamOptions
    }
}}