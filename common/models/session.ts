import mongoose from "mongoose";

export interface ISession {
  confluenceSiteUrl: string;
  orgId: string;
  userId: string;
  cloudId?: string;
  accessToken: string;
  expiresAt?: number;
}

export type Session = ISession & mongoose.Document;

const sessionSchema = new mongoose.Schema(
  {
    confluenceSiteUrl: String,
    orgId: String,
    userId: String,
    cloudId: String,
    accessToken: String,
    expiresAt: Number,
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("Session", sessionSchema);

export const sessionRepo = {
  createOrUpdate: async (session: ISession) => {
    const existingSession = await Session.findOne({
      orgId: session.orgId,
      userId: session.userId,
      confluenceSiteUrl: session.confluenceSiteUrl,
    });
    if (existingSession) {
      await Session.updateOne(
        { _id: new mongoose.Types.ObjectId(existingSession._id) },
        { $set: session },
      );
      return existingSession as Session;
    }
    const newSession = new Session(session);
    const sessionDoc = await newSession.save();
    return sessionDoc as Session;
  },
  getSessionById: async (_id: string): Promise<ISession> => {
    return (await Session.findOne({ _id })) as Session;
  },

  getValidSessionForUser: async (
    orgId: string,
    userId: string,
    confluenceSiteUrl: string,
  ): Promise<Session> => {
    const filters = { orgId, userId, confluenceSiteUrl, expiresAt: { $gt: Date.now() } };
    return (await Session.findOne(filters)) as Session;
  },

  removeSession: async (orgId: string, userId: string, confluenceSiteUrl: string) => {
    await Session.deleteOne({ orgId, userId, confluenceSiteUrl });
  },
};
