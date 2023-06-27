//Mongodb typescrpit schema for thread, properties: userId, threadId, threadLink. Collection will be threads

import mongoose from "mongoose";

/// connect to mongodb use env var MONGODB_URL
mongoose.connect(process.env.MONGO_DB_URL as string);

const threadSchema = new mongoose.Schema({
    userId: String,
    threadId: String,
    teamId: String,
    domain: String,
    threadLink: String,
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
    threadId: string;
    teamId: string;
    domain: string;
    threadLink: string;
    isSaved: boolean;
}


export const threadRepo = {
    create: async (thread: IThread) => {
        const newThread = new Thread(thread);
        return await newThread.save();
    },
    addDetailFields: async (threadDetails:ThreadDetails, threadId:string ) => {
        await Thread.updateOne({ _id: new mongoose.Types.ObjectId(threadId) }, { $set: {...threadDetails, isSaved:true} });
    }

}
