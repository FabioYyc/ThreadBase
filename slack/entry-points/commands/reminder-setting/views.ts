import {
  Block,
  ContextBlock,
  InputBlock,
  KnownBlock,
  ModalView,
  PlainTextOption,
  SectionBlock,
} from "@slack/bolt";
import { IReminderSetting } from "../../../../common/models/reminder-settings";
import {
  replyCountInputBlockId,
  scopeSelectAction,
  threadCharacterLengthInputBlockId,
  reminderConfigViewCallbackId,
  channelSelectBlockId,
} from "./constant";
import { ModalBuilder } from "../../../shared/view/modal-builder";

type Channel = { label: string; id: string };

export class ConfigurationModal implements ModalBuilder {
  private blocks: (Block | KnownBlock)[];

  constructor(
    private options: {
      initialOption?: PlainTextOption;
      channels?: Channel[];
      existingSelectionBlock?: Block | KnownBlock;
    },
  ) {
    this.blocks = [this.createSelectionBlock()];
  }

  private createSelectionBlock(): Block | KnownBlock {
    if (this.options.existingSelectionBlock) {
      return this.options.existingSelectionBlock;
    }

    const channelOptions =
      this.options.channels?.map((channel) => ({
        text: { type: "plain_text", text: channel.label },
        value: channel.id,
      })) || [];

    const workspaceOption = {
      text: { type: "plain_text", text: "Workspace-Setting" },
      value: "workspace",
    };

    channelOptions.unshift(workspaceOption);

    return {
      type: "input",
      dispatch_action: true,
      block_id: channelSelectBlockId,
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Configure channel or workspace level reminder setting",
        },
        options: channelOptions,
        action_id: scopeSelectAction,
        initial_option: this.options.initialOption,
      },
      label: {
        type: "plain_text",
        text: "Scope",
      },
    } as InputBlock;
  }

  addBlock(newBlocks: KnownBlock[]): void {
    this.blocks.push(...newBlocks);
  }

  build(): ModalView {
    return {
      type: "modal",
      callback_id: reminderConfigViewCallbackId,
      title: {
        type: "plain_text",
        text: "Reminder Config",
      },
      submit: {
        type: "plain_text",
        text: "Save",
      },
      blocks: this.blocks,
    };
  }
}

export const infoBlock = (
  channelName: string,
  channelId: string,
): (SectionBlock | ContextBlock)[] => {
  if (channelId === "workspace") {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Reminder Trigger Setting for the Workspace*`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `:warning: This setting will be applied to all channels in the workspace, unless a channel has its own setting.`,
          },
        ],
      },
    ];
  }
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reminder Trigger Setting for ${channelName}*`,
      },
    },
  ];
};

export const configurationBlocks = (reminderSetting: IReminderSetting): KnownBlock[] => {
  return [
    {
      type: "input",
      block_id: replyCountInputBlockId,
      label: {
        type: "plain_text",
        text: "Reply count",
      },
      element: {
        type: "plain_text_input",
        placeholder: {
          type: "plain_text",
          text: "Enter reply count threshold",
        },
        initial_value: reminderSetting.replyCountThreshold?.toString(),
      },
    },
    {
      type: "input",
      block_id: threadCharacterLengthInputBlockId,
      label: {
        type: "plain_text",
        text: "Thread characters",
      },
      element: {
        type: "plain_text_input",
        placeholder: {
          type: "plain_text",
          text: "Enter thread character length threshold",
        },
        initial_value: reminderSetting.threadCharLengthThreshold?.toString(),
      },
    },
  ];
};
