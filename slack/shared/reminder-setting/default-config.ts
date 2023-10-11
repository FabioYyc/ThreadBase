import { IReminderSetting } from "../../../common/models/reminder-settings";

export const defaultReminderSetting: Partial<IReminderSetting> = {
  replyCountThreshold: 5,
  reNotifyInterval: 60,
  threadCharLengthThreshold: 500,
  reNotifyEnabled: false,
  escapeWords: [],
  level: "default",
};
