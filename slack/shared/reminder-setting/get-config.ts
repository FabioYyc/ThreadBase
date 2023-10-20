import { IReminderSetting, reminderSettingRepo } from "../../../common/models/reminder-settings";
import { defaultReminderSetting } from "./default-config";

//TODO: create tests for this function
export const getChannelConfiguration = async ({
  channelId,
  teamId,
}: {
  channelId?: string;
  teamId: string;
}): Promise<IReminderSetting> => {
  let config;

  if (channelId) {
    config = await reminderSettingRepo.get(channelId, teamId);
  }

  if (config) {
    return config as IReminderSetting;
  }

  config = await reminderSettingRepo.getWorkspace(teamId);

  if (config) {
    return config as IReminderSetting;
  }

  return { channelId, teamId, ...defaultReminderSetting } as IReminderSetting;
};
