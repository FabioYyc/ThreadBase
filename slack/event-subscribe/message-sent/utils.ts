import {
  ISlackConversations,
  slackConversationsRepo,
} from "../../../common/models/slack-conversation";

export const createOrUpdateConvoWithReplyCount = async ({
  threadTs,
  channelId,
  threadSenderId,
  teamId,
  replyCount,
  reminderSent = false,
}: {
  threadTs: string;
  channelId: string;
  threadSenderId: string;
  teamId: string;
  replyCount: number;
  reminderSent?: boolean;
}) => {
  const slackConvo: ISlackConversations = {
    channelId,
    threadTs,
    threadSenderId,
    teamId,
    replyCount,
    reminderSent,
  };
  await slackConversationsRepo.createOrUpdate(slackConvo);
};

export const getReplyThresholdForChannel = (channelId: string) => {
  //TODO: get threshold from settings
  return 10;
};

export const replyCountExceedsThreshold = (replyCount: number, channelId: string) => {
  const threshold = getReplyThresholdForChannel(channelId);
  return replyCount >= threshold;
};
