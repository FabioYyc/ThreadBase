import {
  App,
  BlockAction,
  StaticSelectAction,
  ViewOutput,
  ViewWorkflowStepSubmitAction,
} from "@slack/bolt";
import {
  scopeSelectAction,
  reminderCommandName,
  reminderConfigViewCallbackId,
  ConfigViewOutput,
  channelSelectBlockId,
  replyCountInputBlockId,
  threadCharacterLengthInputBlockId,
} from "./constant";
import { configurationBlocks, ConfigurationModal, infoBlock } from "./views";
import { getChannelConfiguration } from "../../../shared/reminder-setting/get-config";
import { viewInputReader } from "../../../utils";
import {
  IReminderSetting,
  ReminderSettingLevel,
  reminderSettingRepo,
} from "../../../../common/models/reminder-settings";

export const configReminderHandler = async (app: App) => {
  app.command(reminderCommandName, async ({ command, ack, say, client }) => {
    await ack();
    const channelResponse = await client.users.conversations();
    const channels =
      channelResponse.channels
        ?.filter(
          (channel) =>
            channel.is_channel &&
            !channel.is_archived &&
            !channel.is_private &&
            !channel.is_mpim &&
            !channel.is_im &&
            channel.id &&
            channel.name,
        )
        .map((channel) => ({
          label: channel.name || "",
          id: channel.id || "",
        })) || [];
    const configModal = new ConfigurationModal({ channels });
    await client.views.open({
      trigger_id: command.trigger_id,
      view: configModal.build(),
    });
  });
};

export const scopeSelectHandler = async (app: App) => {
  app.action(scopeSelectAction, async ({ ack, payload, body, client }) => {
    body = body as BlockAction;
    await ack();
    if (!body.team) {
      throw new Error("No team found");
    }
    if (!body.view) {
      throw new Error("No view found");
    }
    const teamId = body.team.id;
    const scopeSelection = (payload as StaticSelectAction).selected_option;
    if (!scopeSelection) {
      throw new Error("No scope selection found");
    }
    const config = await getChannelConfiguration({ teamId, channelId: scopeSelection.value });
    const configModal = new ConfigurationModal({
      initialOption: scopeSelection,
      existingSelectionBlock: body.view.blocks[0],
    });
    configModal.addBlock(infoBlock(scopeSelection.text.text, scopeSelection.value));
    const channelConfigBlock = configurationBlocks(config);
    configModal.addBlock(channelConfigBlock);

    const newModalView = configModal.build();

    await client.views.update({
      view_id: body.view.id,
      view: newModalView,
    });
  });
};

const viewSubmissionHandler = async (app: App) => {
  app.view(reminderConfigViewCallbackId, async ({ ack, body, view, client }) => {
    await ack();
    body = body as ViewWorkflowStepSubmitAction;
    const teamId = body.team?.id;
    const output = viewInputReader<ConfigViewOutput>(view);
    const channelId = output[channelSelectBlockId].selected_option.value;
    const replyCount = Number(output[replyCountInputBlockId]);
    const threadCharacterLength = Number(output[threadCharacterLengthInputBlockId]);

    if (!teamId) {
      throw new Error("No team id or channel id found");
    }

    const level =
      channelId === "workspace" ? ReminderSettingLevel.WORKSPACE : ReminderSettingLevel.CHANNEL;

    const newReminderSetting: Partial<IReminderSetting> = {
      replyCountThreshold: replyCount,
      threadCharLengthThreshold: threadCharacterLength,
    };
    await reminderSettingRepo.updateOrCreate({ teamId, channelId, level, ...newReminderSetting });

    return;
  });
};

export const reminderSettingHandler = async (app: App) => {
  scopeSelectHandler(app);
  configReminderHandler(app);
  viewSubmissionHandler(app);
};
