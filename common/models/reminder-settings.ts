import mongoose from "mongoose";

//reminder setting should contain channelId, teamId, replyCountThreshold, reNotifyInterval, reNotifyEnabled, escapeWords

export enum ReminderSettingLevel {
  DEFAULT = "default",
  WORKSPACE = "workspace",
  CHANNEL = "channel",
}

export interface IReminderSetting {
  channelId?: string;
  teamId: string;
  replyCountThreshold?: number;
  threadCharLengthThreshold?: number;
  reNotifyInterval?: number;
  reNotifyEnabled?: boolean;
  escapeWords?: string[];
  level: ReminderSettingLevel;
}

export type ReminderSetting = IReminderSetting & mongoose.Document;

const reminderSettingSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      required: true,
    },
    replyCountThreshold: {
      type: Number,
      required: false,
    },
    threadCharLengthThreshold: {
      type: Number,
      required: false,
    },
    reNotifyInterval: {
      type: Number,
      required: false,
    },
    reNotifyEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    escapeWords: {
      type: Array,
      required: false,
      default: [],
    },
    level: {
      type: String,
      required: true,
      default: "default",
    },
  },
  {
    timestamps: true,
  },
);

const ReminderSetting = mongoose.model("ReminderSetting", reminderSettingSchema);

export const reminderSettingRepo = {
  create: async (reminderSetting: IReminderSetting) => {
    return await ReminderSetting.create(reminderSetting);
  },
  updateOrCreate: async (reminderSetting: IReminderSetting) => {
    return await ReminderSetting.updateOne(
      {
        channelId: reminderSetting.channelId,
        teamId: reminderSetting.teamId,
        level: reminderSetting.level,
      },
      reminderSetting,
      { upsert: true },
    );
  },
  get: async (channelId: string, teamId: string) => {
    return await ReminderSetting.findOne({ channelId, teamId });
  },
  getAll: async (teamId: string) => {
    return await ReminderSetting.find({ teamId });
  },
  getWorkspace: async (teamId: string) => {
    return await ReminderSetting.findOne({ teamId, level: ReminderSettingLevel.WORKSPACE });
  },
  delete: async (channelId: string, teamId: string) => {
    return await ReminderSetting.deleteOne({ channelId, teamId });
  },
};
