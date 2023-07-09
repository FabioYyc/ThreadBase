import mongoose from "mongoose";

export interface IUserUI{
    orgId:string;
    userId: string;
    latestTeamId?: string;
}

const UserUISchema = new mongoose.Schema({
    orgId: String,
    userId: String,
    latestTeamId: String,
});

const UserUI = mongoose.model("UserUI", UserUISchema);

export const userUIRepo = {
    createOrUpdate: async (userUI: IUserUI) => {
        const existingUserUI = await UserUI.findOne({ userId: userUI.userId, orgId: userUI.orgId });
        if (existingUserUI) {
            await UserUI.updateOne({ _id: new mongoose.Types.ObjectId(existingUserUI._id) }, { $set: userUI });
        } else {
            const newUserUI = new UserUI(userUI);
            await newUserUI.save();
        }
    },
    getUserUIByUserId: async (orgId:string, userId: string): Promise<IUserUI> => {
        return await UserUI.findOne({ orgId, userId: userId }) as IUserUI;
    }

}

export const updateUserUILatestTeamId = async (orgId:string, userId: string, latestTeamId?: string): Promise<void> => {
    const userUI = ({
        orgId,
        userId,
        latestTeamId
    })
    await userUIRepo.createOrUpdate(userUI);
}


export const getLatestTeamIdForUser = async (orgId:string, userId: string) => {
    const userUI = await userUIRepo.getUserUIByUserId(orgId, userId);
    return userUI?.latestTeamId;
}