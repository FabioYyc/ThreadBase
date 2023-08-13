import { Block, KnownBlock, View } from "@slack/bolt";
import { ISavedThread } from "../../../common/modules/thread";
import { ISavedTeam } from "../../../common/modules/team";
import { getTeamsForUser } from "../home-saved-chat/teams/utils";

export const saveChatCallbackId = 'save-chat-view'
export const editChatCallbackId = 'edit-chat-view'


export const getTeamMultiSelect = (teams: ISavedTeam[]):  (Block | KnownBlock) => ({
    "type": "input",
    block_id: 'teams',
    "element": {
        "type": "multi_static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select teams to store this chat in, if left blank, it will be stored in your personal space",
            "emoji": true
        },
        "options": teams.map(team => ({
            "text": {
                "type": "plain_text",
                "text": team.teamName,
                "emoji": true
            },
            "value": team.id
        })),
        "action_id": "chat_team_select_action"
    },
    "label": {
        "type": "plain_text",
        "text": "Select teams",
        "emoji": true
    },
    optional: true
})


export const createChatView = async ({externalId, thread, isEdit = false, userId, orgId}:{externalId: string, isEdit? : boolean, thread?: ISavedThread, userId: string, orgId: string}): Promise<View> => {
    if(isEdit && !thread) {
        throw new Error('Missing thread')
    }

    const teams= await getTeamsForUser(orgId, userId)
    const blocks:  (Block | KnownBlock)[] = [
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
        // {
        //     "type": "input",
        //     block_id: 'keywords',
        //     "label": {
        //         "type": "plain_text",
        //         "text": "Keywords",
        //         "emoji": true
        //     },
        //     "element": {
        //         "type": "plain_text_input",
        //         "multiline": false,
        //         "placeholder": {
        //             "type": "plain_text",
        //             "text": "Keywords separated by commas, for example: frontend, css",
        //             "emoji": true
        //         },
        //         initial_value: isEdit ? thread?.keywords.join(',') : undefined
        //     }
        // },
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
        },
    ]
    let teamMultiSelect;
    if(teams){
        teamMultiSelect = getTeamMultiSelect(teams)
        blocks.push(teamMultiSelect)
    }

    
    return {
        "type": "modal",
        callback_id: isEdit? editChatCallbackId : saveChatCallbackId,
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
        "blocks": blocks
    }}


export const confirmationMessage = (userName:string) => ([
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `@${userName}, Great work! You can now find the saved chat in the *ThreadBase* app's Home tab :rocket:`
        }
    }
])