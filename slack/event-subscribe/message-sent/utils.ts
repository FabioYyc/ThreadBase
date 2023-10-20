import { IReminderSetting } from "../../../common/models/reminder-settings";
import { ConversationsRepliesResponse } from "@slack/web-api";
import {
  IReminder,
  ISlackConversations,
  slackConversationsRepo,
} from "../../../common/models/slack-conversation";
import { getChannelConfiguration } from "../../shared/reminder-setting/get-config";

export const createOrUpdateConvoWithReplyCount = async ({
  threadTs,
  channelId,
  threadSenderId,
  teamId,
  replyCount,
}: {
  threadTs: string;
  channelId: string;
  threadSenderId: string;
  teamId: string;
  replyCount: number;
}) => {
  const slackConvo: ISlackConversations = {
    channelId,
    threadTs,
    threadSenderId,
    teamId,
    replyCount,
  };
  return await slackConversationsRepo.createOrUpdate(slackConvo);
};

const replyCountExceedsThreshold = (replyCount: number, reminderSetting: IReminderSetting) => {
  const threshold = reminderSetting.replyCountThreshold;
  return threshold && replyCount >= threshold;
};

const replyTextLengthExceedsThreshold = ({
  reminderSetting,
  replyText,
}: {
  replyText: string;
  reminderSetting: IReminderSetting;
}) => {
  const threshold = reminderSetting.threadCharLengthThreshold;
  return threshold && replyText.length >= threshold;
};

const reminderHasSent = (slackConvo: ISlackConversations) => {
  return slackConvo.reminderSent && slackConvo.reminderSent.length > 0;
};

export const shouldSendReminder = async ({
  latestMessage,
  slackConvo,
}: {
  latestMessage?: string;
  slackConvo: ISlackConversations;
}) => {
  const reminderSetting = await getChannelConfiguration({
    channelId: slackConvo.channelId,
    teamId: slackConvo.teamId,
  });

  if (reminderHasSent(slackConvo)) {
    return false;
  }

  const thresholdCheck =
    replyCountExceedsThreshold(slackConvo.replyCount, reminderSetting) ||
    replyTextLengthExceedsThreshold({
      replyText: latestMessage || "",
      reminderSetting,
    });

  return thresholdCheck;
};
