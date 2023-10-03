import { slackConversationsRepo } from "../../../common/models/slack-conversation";

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
  const existingConvo = await slackConversationsRepo.findOne({
    channelId,
    threadTs,
    threadSenderId,
  });
  if (existingConvo) {
    await slackConversationsRepo.updateOne(
      { _id: new mongoose.Types.ObjectId(existingConvo._id) },
      { $set: { replyCount } },
    );
    return existingConvo as SlackConversations;
  }
};
