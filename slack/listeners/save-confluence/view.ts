import { ActionsBlock, Block, ModalView, SectionBlock, View } from "@slack/bolt"
import { confluenceDomainActionId } from "./constants"

export const authButtonLinkBlock = (authorizeUrl: string, confluenceSiteUrl: string): SectionBlock[] => {
    return [{
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `Link your account with Confluence site \n ${confluenceSiteUrl}`
        },
        "accessory": {
            "type": "button",
            "style": "primary",
            "text": {
                "type": "plain_text",
                "text": "Link Now",
                "emoji": true
            },
            "value": "create_confluence",
            "url": authorizeUrl,
            "action_id": "authorize_confluence"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `:information_source: _Close this window and use the shortcut again after you've linked your workspace._`
        },
    },

    ]
}

export const createConfluenceAuthModal = () => {
    const setDomainModal: View = {
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Confluence Integration",
            "emoji": true
        },
        "blocks": [
            {
                "dispatch_action": true,
                "type": "input",
                "element": {
                    "type": "plain_text_input",
                    "action_id": confluenceDomainActionId,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "mycompany.atlassian.net",
                        "emoji": true
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Enter your Confluence Site URL",
                    "emoji": true
                }
            }
        ]
    }

    const saveToConfluencePageModal = ({ conflunceWorkspaceUrl }: { conflunceWorkspaceUrl?: string }): ModalView => {
        return {
            "type": "modal",
            "callback_id": "save_to_confluence",
            "title": {
                "type": "plain_text",
                "text": "Save to Confluence",
                "emoji": true
            },
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": "Add more info to this chat and you'll find it easily next time! :brain:",
                        "emoji": true
                    }
                }
            ]
        }
    
    }

    return {
        setDomainView: () => setDomainModal as View,
        appendLinkButton: (authorizeUrl: string, confluenceSiteUrl: string, viewId: string, hash: string) => {
            const newModal = { ...setDomainModal };
            newModal.blocks = [...newModal.blocks, ...authButtonLinkBlock(authorizeUrl, confluenceSiteUrl)];
            return {
                view_id: viewId,
                hash: hash,
                view: newModal
            }
        },
        saveToConfluencePageModal: ()=> saveToConfluencePageModal({})
    }
}


