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
    reminderSent: false,
  };
  await slackConversationsRepo.createOrUpdate(slackConvo);
};
