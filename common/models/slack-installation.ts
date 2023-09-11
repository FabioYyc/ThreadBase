import mongoose, { Document } from "mongoose";

// TypeScript Type
export type SlackInstallation = {
  enterpriseId?: string;
  teamId: string;
  botToken: string;
  botId: string;
  botUserId: string;
};

// Map it to a Mongoose document for type safety during CRUD operations
export type SlackInstallationDocument = SlackInstallation & Document;

const SlackInstallationSchema = new mongoose.Schema({
  enterpriseId: { type: String, required: false },
  teamId: { type: String, required: true },
  botToken: { type: String, required: true },
  botId: { type: String, required: true },
  botUserId: { type: String, required: true },
});

const SlackInstallationModel = mongoose.model<SlackInstallationDocument>(
  "SlackInstallation",
  SlackInstallationSchema,
);

// Repo functions
export const slackInstallationRepo = {
  createOrUpdate: async (install: SlackInstallation) => {
    const criteria = install.teamId;
    const existingInstall = await SlackInstallationModel.findOne({ teamId: criteria });

    if (existingInstall) {
      await SlackInstallationModel.updateOne({ _id: existingInstall._id }, { $set: install });
      return existingInstall;
    }

    const newInstall = new SlackInstallationModel(install);
    return await newInstall.save();
  },

  getByTeamId: async (teamId: string): Promise<SlackInstallationDocument | null> => {
    return SlackInstallationModel.findOne({ teamId: teamId });
  },

  getByEnterpriseId: async (enterpriseId: string): Promise<SlackInstallationDocument | null> => {
    return SlackInstallationModel.findOne({ enterpriseId: enterpriseId });
  },

  removeByTeamId: async (teamId: string) => {
    await SlackInstallationModel.deleteOne({ teamId: teamId });
  },

  removeByEnterpriseId: async (enterpriseId: string) => {
    await SlackInstallationModel.deleteOne({ enterpriseId: enterpriseId });
  },
};
