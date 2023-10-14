import {
  Block,
  InputBlock,
  KnownBlock,
  ModalView,
  PlainTextOption,
  StaticSelectAction,
} from "@slack/bolt";
import { IReminderSetting } from "../../../../common/models/reminder-settings";
import {
  replyCountInputBlockId,
  scopeSelectAction,
  threadCharacterLengthInputBlockId,
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

    return {
      type: "input",
      dispatch_action: true,
      block_id: "channel_select",
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
      callback_id: "reminder_setting_modal",
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
export const configurationBlocks = (reminderSetting: IReminderSetting): KnownBlock[] => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Reminder Trigger Setting*",
      },
    },
    {
      type: "input",
      block_id: replyCountInputBlockId,
      label: {
        type: "plain_text",
        text: "Reply count",
      },
      element: {
        type: "plain_text_input",
        action_id: "reply_count_value",
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
        action_id: "thread_char_value",
        placeholder: {
          type: "plain_text",
          text: "Enter thread character length threshold",
        },
        initial_value: reminderSetting.threadCharLengthThreshold?.toString(),
      },
    },
  ];
};
