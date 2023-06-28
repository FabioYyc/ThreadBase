//Mongodb typescrpit schema for thread, properties: userId, threadId, threadLink. Collection will be threads

import mongoose, { Document, Mongoose } from "mongoose";

/// connect to mongodb use env var MONGODB_URL
mongoose.connect(process.env.MONGO_DB_URL as string);

const threadSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    threadId: String,
    teamId: String,
    domain: String,
    threadLink: String,
    channelId: String,
    title: String,
    description: String,
    keywords: Array,
    isSaved: Boolean,
});

const Thread = mongoose.model("Thread", threadSchema);

export interface ThreadDetails {
    title: string;
    description?: string;
    keywords: Array<string>;
}

export interface IThread{
    userId: string;
    userName: string;
    threadId: string;
    teamId: string;
    domain: string;
    threadLink: string;
    channelId: string;
    isSaved: boolean;
}

//Join thread and threadDetails as a new type
export interface ISavedThread extends IThread, ThreadDetails, Document {}

export const threadRepo = {
    create: async (thread: IThread) => {
        const newThread = new Thread(thread);
        return await newThread.save();
    },
    addDetailFields: async (threadDetails:ThreadDetails, threadId:string ) => {
        await Thread.updateOne({ _id: new mongoose.Types.ObjectId(threadId) }, { $set: {...threadDetails, isSaved:true} });
        //return the thread
        return await Thread.findOne({ _id: new mongoose.Types.ObjectId(threadId) }) as IThread;
    },

    getSavedThreadForUser: async (userId: string): Promise<ISavedThread[]> => {
        return await Thread.find({ userId: userId, isSaved: true }) || [];
    }

}
