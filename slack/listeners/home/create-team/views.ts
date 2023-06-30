import { View } from "@slack/bolt"

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

export const createChatView = ({externalId, thread, isEdit = false, }:{externalId: string, isEdit? : boolean, thread?: ISavedThread}): View => {
    if(isEdit && !thread) {
        throw new Error('Missing thread')
    }
    
    return {
        "type": "modal",
        callback_id: createTeamModalCallBackId,
        external_id: externalId,
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
            "text": "Save this chat :memo:",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Add more info to this chat and you'll find it easily next time! :brain:",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                block_id: 'title',
                "label": {
                    "type": "plain_text",
                    "text": "What's this chat about? :thinking_face:",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": false,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Give a short summary of the chat",
                        "emoji": true
                    },
                    initial_value: isEdit ? thread?.title : undefined
                }
            },
            {
                "type": "input",
                block_id: 'keywords',
                "label": {
                    "type": "plain_text",
                    "text": "Keywords",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": false,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Keywords separated by commas, for example: frontend, css",
                        "emoji": true
                    },
                    initial_value: isEdit ? thread?.keywords.join(',') : undefined
                }
            },
            {
                "type": "input",
                block_id: 'description',
                "label": {
                    "type": "plain_text",
                    "text": "Description",
                    "emoji": true
                },
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "A few lines that describe the chat",
                        "emoji": true
                    },
                    initial_value: isEdit ? thread?.description : undefined
                },
                "optional": true
            }
        ]
    }}

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