import { ModalView, PlainTextOption, SectionBlock, View } from "@slack/bolt"
import { IPage, confluenceDomainActionId } from "./constants"
import { IConfluenceAuth } from "../../../common/modules/userUI"
import { values } from "lodash"

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
            "text": `:information_source: _Close this window and use the shortcut again after you've linked your site._`
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

    const saveToConfluencePageModal = ({ confluenceSiteUrl, pages, messageLink }: { confluenceSiteUrl?: string, pages: IPage[], messageLink?: string }): ModalView => {
        const options: PlainTextOption[] = pages.map(page => {
            return {
                "text": {
                    "type": "plain_text",
                    "text": page.title,
                    "emoji": true
                },
                "value": page.id
            }
        })
        return {
            "type": "modal",
            "callback_id": "save_to_confluence",
            "submit": {
                "type": "plain_text",
                "text": "Submit",
                "emoji": true
            },
            "title": {
                "type": "plain_text",
                "text": "Save to Confluence",
                "emoji": true
            },
            blocks: [
                {
                    "type": "section",
                    fields:[
                        {
                            "type": "plain_text",
                            "text": "Create a Confluence page",
                            "emoji": true
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Confluence Site* \n ${confluenceSiteUrl}`
                        }
                    ]
                },
                {
                    "type": "input",
                    block_id: 'parent_page',
                    "element": {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select the parent page for the",
                            "emoji": true
                        },
                        "options": options,
                        "action_id": "static_select-action"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Select Page",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    block_id: 'title',
                    "element": {
                        "type": "plain_text_input",
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Page Title",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    block_id: 'content',
                    "element": {
                        "type": "plain_text_input",
                        "multiline": true,
                        initial_value: messageLink

                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Page Content",
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
        saveToConfluencePageModal
    }
}