import mongoose, { Document, ClientSession } from "mongoose";

export enum UserRole {
  Member = "member",
  Owner = "owner",
}

export interface IConfluenceAuth {
  refreshToken: string;
  siteUrl: string;
}

export interface ITeamInfo {
  teamId: string;
  userRole: string;
}

export interface IUser {
  userId: string;
  orgId: string;
  teams: ITeamInfo[];
  latestTeamId?: string;
  auth?: {
    confluence?: IConfluenceAuth[];
  };
}

const ConfluenceAuthSchema = new mongoose.Schema({
  siteUrl: String,
  refreshToken: String,
});

const TeamInfoSchema = new mongoose.Schema({
  teamId: String,
  userRole: String,
});

const UserSchema = new mongoose.Schema({
  userId: String,
  orgId: String,
  teams: [TeamInfoSchema],
  latestTeamId: String,
  auth: {
    confluence: [ConfluenceAuthSchema],
  },
});

const User = mongoose.model("User", UserSchema);

export interface ISavedUser extends Document, IUser {}

export const UserRepo = (clientSession?: ClientSession) => {
  const sessionOption = clientSession ? { session: clientSession } : {};

  return {
    createOrUpdateUserUI: async (userUI: Partial<IUser>) => {
      const existingUserUI = await User.findOne({ userId: userUI.userId, orgId: userUI.orgId });
      if (existingUserUI) {
        await User.updateOne(
          { _id: new mongoose.Types.ObjectId(existingUserUI._id) },
          { $set: userUI },
        );
      } else {
        const newUserUI = new User(userUI);
        await newUserUI.save();
      }
    },

    findByUserId: async ({
      userId,
      orgId,
    }: {
      userId: string;
      orgId: string;
    }): Promise<ISavedUser | null> => {
      const user = await User.findOne({ userId, orgId }, {}, sessionOption);
      return user as ISavedUser;
    },

    create: async (user: IUser) => {
      const newUser = new User(user);
      return await newUser.save(sessionOption);
    },

    addTeamToUser: async ({
      userId,
      team,
      orgId,
    }: {
      userId: string;
      orgId: string;
      team: ITeamInfo;
    }) => {
      await User.updateOne({ userId, orgId }, { $push: { teams: team } }, sessionOption);
    },

    removeTeamFromUser: async ({
      userId,
      teamId,
      orgId,
    }: {
      userId: string;
      orgId: string;
      teamId: string;
    }) => {
      await User.updateOne({ userId, orgId }, { $pull: { teams: { teamId } } }, sessionOption);
    },

    getUserUIByUserId: async (orgId: string, userId: string): Promise<IUser> => {
      return (await User.findOne({ orgId, userId }, {}, sessionOption)) as IUser;
    },

    updateByUserId: async (orgId: string, userId: string, user: Partial<IUser>) => {
      await User.updateOne({ orgId, userId }, { $set: user }, sessionOption);
    },

    createOrUpdateUserAuth: async ({
      orgId,
      userId,
      authType,
      authData,
    }: {
      orgId: string;
      userId: string;
      authType: "confluence";
      authData: IConfluenceAuth;
    }) => {
      const existingUserDoc = await User.findOne({ orgId, userId });
      let user;

      user = existingUserDoc?.toObject() as IUser;

      if (!user) {
        // create a new user
        const newUser = new User({
          orgId,
          userId,
        });
        user = await newUser.save();
      }

      const auth = user.auth || {};
      const authArray = auth[authType] || [];

      const existingDomainIndex = authArray.findIndex((a) => a.siteUrl === authData.siteUrl);

      if (existingDomainIndex !== -1) {
        authArray[existingDomainIndex].refreshToken = authData.refreshToken;
      } else {
        authArray.push(authData);
      }

      auth[authType] = authArray;
      const result = await User.updateOne({ orgId, userId }, { $set: { auth } });
      return result;
    },

    removeConfluenceAuth: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      const user = await User.findOne({ orgId, userId });
      if (!user) {
        throw new Error("User not found");
      }
      await User.updateOne({ orgId, userId }, { $pull: { "auth.confluence": {} } }, sessionOption);
    },
  };
};

export const getLatestTeamIdForUser = async (orgId: string, userId: string) => {
  const userRepo = UserRepo();
  const userUI = await userRepo.getUserUIByUserId(orgId, userId);
  return userUI?.latestTeamId;
};

export const updateUserUILatestTeamId = async (
  orgId: string,
  userId: string,
  latestTeamId?: string,
): Promise<void> => {
  const userUI = {
    orgId,
    userId,
    latestTeamId,
  };
  const userRepo = UserRepo();
  await userRepo.createOrUpdateUserUI(userUI);
};
