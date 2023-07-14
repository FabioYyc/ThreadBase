//Mongodb typescrpit schema for thread, properties: userId, threadId, threadLink. Collection will be threads

import mongoose, { Document } from "mongoose";

/// connect to mongodb use env var MONGODB_URL
const threadSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    threadTs: String,
    orgId: String,
    domain: String,
    threadLink: String,
    channelId: String,
    title: {
        type: String,
        text: true
    },
    description: String,
    keywords: Array,
    teams: Array,
    isSaved: Boolean,
});

const Thread = mongoose.model("Thread", threadSchema);

export interface ThreadDetails {
    title: string;
    description?: string;
    keywords: Array<string>;
    teams?: Array<string>;
}

export interface IThread{
    userId: string;
    userName: string;
    threadTs: string;
    orgId: string;
    domain: string;
    threadLink: string;
    channelId: string;
    isSaved: boolean;
}

//Join thread and threadDetails as a new type
export interface ISavedThread extends IThread, ThreadDetails, Document {}
interface SearchParams {
    orgId: string;
    userId: string;
    searchTerm: string;
  }
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

    getPersonalSavedThreadForUser: async (orgId:string, userId: string): Promise<ISavedThread[]> => {
        //find all threads with userId , isSaved = true, teams = [] or null
        return await Thread.find({ orgId, userId: userId, isSaved: true, teams: { $in: [ [], null ] } }) || [];
    },

    getSavedThreadForTeam: async (teamId: string): Promise<ISavedThread[]> => {
        return await Thread.find({ teams: teamId, isSaved: true }) || [];
    },

    deleteSavedThread: async (threadId: string) => {
        await Thread.deleteOne({ _id: new mongoose.Types.ObjectId(threadId) });
    },

    getThreadById: async (threadId: string) => {
        return await Thread.findOne({ _id: new mongoose.Types.ObjectId(threadId) });
    },

    searchByTitle: async ({ orgId, userId, searchTerm }: SearchParams) => {
        const matchCondition: { [key: string]: string } = { orgId, userId };
        
        const pipeline = [
          {
            $search: {
              index: 'title_search_index',
              text: {
                path: 'title',
                query: searchTerm,
                fuzzy: {}
              }
            }
          },
          {
            $match: matchCondition
          },
          {
            $limit: 10
          }
        ];
      
        // Use the aggregate() function to execute the pipeline
        const results =  await Thread.aggregate(pipeline) || [];

        return results as ISavedThread[];
      }
}
