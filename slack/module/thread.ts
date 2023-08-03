//Mongodb typescrpit schema for thread, properties: userId, threadId, threadLink. Collection will be threads

import mongoose, { Document } from "mongoose";
import { searchTextLimit } from "../types";
import { teamRepo, userTeamsRepo } from "./team";
import { getTeamsForUser } from "../listeners/home-saved-chat/teams/utils";

/// connect to mongodb use env var MONGODB_URL
const threadSchema = new mongoose.Schema({
  userId: String,
  senderId: String,
  userName: String,
  messageTs: String,
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
  textSearch: String,
  isReply: Boolean,
});

const Thread = mongoose.model("Thread", threadSchema);

export interface ThreadDetails {
  title: string;
  description?: string;
  keywords?: Array<string>;
  teams?: Array<string>;
  textSearch?: string;
}

export interface IThread {
  userId: string;
  userName: string;
  messageTs: string;
  orgId: string;
  domain: string;
  threadLink: string;
  channelId: string;
  senderId: string;
  isSaved: boolean;
  isReply: boolean;
}

//Join thread and threadDetails as a new type
export interface ISavedThread extends IThread, ThreadDetails, Document { }
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
  addDetailFields: async (threadDetails: ThreadDetails, threadId: string) => {
    const textSearch = `${threadDetails.title} ${threadDetails.description}`;
    //slice the textSearch to 100 characters
    threadDetails.textSearch = textSearch.slice(0, searchTextLimit);
    await Thread.updateOne({ _id: new mongoose.Types.ObjectId(threadId) }, { $set: { ...threadDetails, isSaved: true } });
    //return the thread
    return await Thread.findOne({ _id: new mongoose.Types.ObjectId(threadId) }) as IThread;
  },

  getPersonalSavedThreadForUser: async (orgId: string, userId: string): Promise<ISavedThread[]> => {
    //find all threads with userId , isSaved = true, teams = [] or null
    return await Thread.find({ orgId, userId: userId, isSaved: true, teams: { $in: [[], null] } }) || [];
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

  searchByText: async ({ orgId, userId, searchTerm }: SearchParams) => {
    // const matchCondition: { [key: string]: string } = { orgId, userId };
    /**
     * only return thread
     * in user's personal space, which means teams = [] or null and userId = userId
     * in team space user belongs to, which means
     * 1. need to get all teams user belongs to use userTeamsRepo
     * 2. teams = [teamId1, teamId2, ...]
     */
    const teams = await getTeamsForUser(orgId, userId)
    const teamIds = teams.map((team) => team.id) || [];

    // Constructing the matchCondition
    const matchCondition = {
      $or: [
        // Personal Space
        {
          userId: userId,
          $or: [
            { teams: { $eq: [] } },
            { teams: { $eq: null } }
          ]
        },
        // Team Space
        {
          teams: {
            $in: teamIds
          }
        }
      ]
    };

    const pipeline = [
      {
        $search: {
          index: "thread_text_search_index",
          text: {
            query: searchTerm,
            path: "textSearch"
          }
        }
      },
      {
        $match: matchCondition
      },
      {
        $limit: 20
      }
    ];
    console.log('pipeline', pipeline)
    const results = await Thread.aggregate(pipeline) || [];

    return results as ISavedThread[];
  }
}
