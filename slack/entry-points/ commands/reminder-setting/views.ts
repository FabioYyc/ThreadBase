import {
  Block,
  InputBlock,
  KnownBlock,
  ModalView,
  PlainTextOption,
  StaticSelectAction,
} from "@slack/bolt";
import { IReminderSetting } from "../../../../common/models/reminder-settings";
import { scopeSelectAction } from "./constant";

type Channel = { label: string; id: string };

export const createConfigurationModal = (options?: {
  initialOption?: PlainTextOption;
  channels?: Channel[];
  existingSelectionBlock?: Block | KnownBlock;
  //TODO: allow pass in a viewModal object to be default get view
}) => {
  const channelOptions: PlainTextOption[] =
    options?.channels?.map((channel) => ({
      text: {
        type: "plain_text",
        text: channel.label,
      },
      value: channel.id,
    })) || [];

  const selectionBlock = options?.existingSelectionBlock
    ? options?.existingSelectionBlock
    : {
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
          initial_option: options?.initialOption,
        },
        label: {
          type: "plain_text",
          text: "Scope",
        },
      };

  let blocks: (Block | KnownBlock)[] = [selectionBlock];

  // Exposed methods
  return {
    getView: (): ModalView => ({
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
      blocks: blocks,
    }),
    addBlock: (newBlocks: KnownBlock[]) => {
      blocks.push(...newBlocks);
    },
  };
};
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
      block_id: "reply_count_input",
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
      block_id: "thread_char_input",
      label: {
        type: "plain_text",
        text: "Thread character",
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
