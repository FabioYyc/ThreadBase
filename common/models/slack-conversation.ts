import mongoose from "mongoose";

export interface ISlackConversations {
  channelId: string;
  threadTs: string;
  threadSenderId: string;
  teamId: string;
  reminderSent: boolean;
  replyCount: number;
}

export type SlackConversations = ISlackConversations & mongoose.Document;

const slackConversationsSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
    },
    threadTs: {
      type: String,
      required: true,
    },
    threadSenderId: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      required: true,
      default: false,
    },
    replyCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const SlackConversations = mongoose.model("SlackConversations", slackConversationsSchema);

export const slackConversationsRepo = {
  createOrUpdate: async (slackConvo: ISlackConversations) => {
    const existingConvo = await SlackConversations.findOne({
      channelId: slackConvo.channelId,
      threadTs: slackConvo.threadTs,
      threadSenderId: slackConvo.threadSenderId,
    });
    if (existingConvo) {
      await SlackConversations.updateOne(
        { _id: new mongoose.Types.ObjectId(existingConvo._id) },
        { $set: slackConvo },
      );
      return existingConvo as SlackConversations;
    }
    const newConvo = new SlackConversations(slackConvo);
    const convoDoc = await newConvo.save();
    return convoDoc as SlackConversations;
  },

  getConversationById: async (_id: string): Promise<ISlackConversations> => {
    return (await SlackConversations.findOne({ _id })) as SlackConversations;
  },

  getConversationByChannelAndThread: async (
    channelId: string,
    threadTs: string,
  ): Promise<SlackConversations> => {
    return (await SlackConversations.findOne({ channelId, threadTs })) as SlackConversations;
  },

  removeConversation: async (channelId: string, threadTs: string) => {
    await SlackConversations.deleteOne({ channelId, threadTs });
  },
};
