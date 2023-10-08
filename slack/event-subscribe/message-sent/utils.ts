import {
  IReminder,
  ISlackConversations,
  slackConversationsRepo,
} from "../../../common/models/slack-conversation";

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

export const getReplyThresholdForChannel = (channelId: string) => {
  //TODO: get threshold from settings
  return 10;
};

const replyCountExceedsThreshold = (replyCount: number, channelId: string) => {
  const threshold = getReplyThresholdForChannel(channelId);
  return replyCount >= threshold;
};

const reminderHasSent = (slackConvo: ISlackConversations) => {
  return slackConvo.reminderSent && slackConvo.reminderSent.length > 0;
};

export const shouldSendReminder = (slackConvo: ISlackConversations) => {
  return (
    replyCountExceedsThreshold(slackConvo.replyCount, slackConvo.channelId) &&
    reminderHasSent(slackConvo)
  );
};
