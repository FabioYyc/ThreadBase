import { Option } from "@slack/bolt";

export const reminderCommandName = "/config-reminder";
export const scopeSelectAction = "channel-select";
export const replyCountInputBlockId = "reply-count-input";
export const threadCharacterLengthInputBlockId = "thread-character-length-input";
export const reminderConfigViewCallbackId = "reminder_setting_modal";
export const channelSelectBlockId = "channel-select-block";
export interface ConfigViewOutput {
  [channelSelectBlockId]: {
    type: string;
    selected_option: Option;
  };
  [replyCountInputBlockId]: string;
  [threadCharacterLengthInputBlockId]: string;
}
