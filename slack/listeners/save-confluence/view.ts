import { ActionsBlock, Block, SectionBlock, View } from "@slack/bolt"
import { confluenceDomainActionId } from "./constants"

export const authButtonLinkBlock = (authorizeUrl: string, confluenceSiteUrl:string): SectionBlock => {
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `Link your account with Confluence site \n ${confluenceSiteUrl} `
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
    }
}

export const createConfluenceAuthModal = () => {
    const baseModal: View = {
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

    return {
        setDomainView: () => baseModal as View,
        appendLinkButton: (authorizeUrl:string, confluenceSiteUrl:string, viewId: string, hash: string) => {
            const newModal = {...baseModal};
            newModal.blocks = [...newModal.blocks, authButtonLinkBlock(authorizeUrl, confluenceSiteUrl)];
            return {
                view_id: viewId,
                hash: hash,
                view: newModal
            }
        }
    }
}
