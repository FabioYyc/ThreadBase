import mongoose from "mongoose";

export interface IUserUI{
    userId: string;
    latestTeamId?: string;
}

const UserUISchema = new mongoose.Schema({
    userId: String,
    latestTeamId: String,
});

const UserUI = mongoose.model("UserUI", UserUISchema);

export const userUIRepo = {
    createOrUpdate: async (userUI: IUserUI) => {
        const existingUserUI = await UserUI.findOne({ userId: userUI.userId });
        if (existingUserUI) {
            await UserUI.updateOne({ _id: new mongoose.Types.ObjectId(existingUserUI._id) }, { $set: userUI });
        } else {
            const newUserUI = new UserUI(userUI);
            await newUserUI.save();
        }
    },
    getUserUIByUserId: async (userId: string): Promise<IUserUI> => {
        return await UserUI.findOne({ userId: userId }) as IUserUI;
    }

}

export const updateUserUILatestTeamId = async (userId: string, latestTeamId?: string) => {
    const userUI = ({
        userId,
        latestTeamId
    })
    await userUIRepo.createOrUpdate(userUI);
}


export const getLatestTeamIdForUser = async (userId: string) => {
    const userUI = await userUIRepo.getUserUIByUserId(userId);
    return userUI.latestTeamId;
}