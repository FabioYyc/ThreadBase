import mongoose from "mongoose";

export interface ISession {
    confluenceSiteUrl: string;
    orgId: string;
    userId: string;
    accessToken: string;
    expiresAt?: number;
}

export type Session = ISession & mongoose.Document;

const sessionSchema = new mongoose.Schema({
    confluenceSiteUrl: String,
    orgId: String,
    userId: String,
    accessToken: String,
    expiresAt: Number,
});

const Session = mongoose.model("Session", sessionSchema);

export const sessionRepo = {
    create: async (session: ISession) => {
        const newSession = new Session(session);
        return await newSession.save();
    },
    getSessionById: async (_id: string): Promise<ISession> => {
        return await Session.findOne({ _id }) as Session;
    },

    getValidSessionForUser: async (orgId: string, userId: string, confluenceSiteUrl: string): Promise<ISession> => {
        const filters = { orgId, userId, confluenceSiteUrl,  expiresAt: { $gt: Date.now() } }
        return await Session.findOne(filters) as Session;
    }
}