import mongoose from "mongoose";

export interface IConfluenceAuth {
  refreshToken: string;
  siteUrl: string;
}

export interface IUserUI {
  orgId: string;
  userId: string;
  latestTeamId?: string;
  auth?: {
    confluence?: IConfluenceAuth[];
  };
}

const ConfluenceAuthSchema = new mongoose.Schema({
  siteUrl: String,
  refreshToken: String,
});

const UserUISchema = new mongoose.Schema({
  orgId: String,
  userId: String,
  latestTeamId: String,
  auth: {
    confluence: [ConfluenceAuthSchema],
  },
});

const UserUI = mongoose.model("UserUI", UserUISchema);

export const userUIRepo = {
  createOrUpdate: async (userUI: IUserUI) => {
    const existingUserUI = await UserUI.findOne({ userId: userUI.userId, orgId: userUI.orgId });
    if (existingUserUI) {
      await UserUI.updateOne(
        { _id: new mongoose.Types.ObjectId(existingUserUI._id) },
        { $set: userUI },
      );
    } else {
      const newUserUI = new UserUI(userUI);
      await newUserUI.save();
    }
  },
  getUserUIByUserId: async (orgId: string, userId: string): Promise<IUserUI> => {
    return (await UserUI.findOne({ orgId, userId: userId })) as IUserUI;
  },

  updateByUserId: async (orgId: string, userId: string, userUI: Partial<IUserUI>) => {
    await UserUI.updateOne({ orgId, userId: userId }, { $set: userUI });
  },

  updateAuthByUserId: async ({
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
    const existingUserDoc = await UserUI.findOne({ orgId, userId });

    if (!existingUserDoc) {
      // Handle the case where the user doesn't exist if necessary
      // For example, you might want to throw an error, return, or create a new user record.
      console.log("user not found", orgId, userId);
      return; // Or throw new Error('User not found');
    }

    const existingUser = existingUserDoc?.toObject() as IUserUI;

    const auth = existingUser.auth || {};
    const authArray = auth[authType] || [];

    const existingDomainIndex = authArray.findIndex((a) => a.siteUrl === authData.siteUrl);

    if (existingDomainIndex !== -1) {
      authArray[existingDomainIndex].refreshToken = authData.refreshToken;
    } else {
      authArray.push(authData);
    }

    auth[authType] = authArray;
    const result = await UserUI.updateOne({ orgId, userId }, { $set: { auth } });
    return result;
  },
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
  await userUIRepo.createOrUpdate(userUI);
};

export const getLatestTeamIdForUser = async (orgId: string, userId: string) => {
  const userUI = await userUIRepo.getUserUIByUserId(orgId, userId);
  return userUI?.latestTeamId;
};
