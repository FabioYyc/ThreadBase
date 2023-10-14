import { App, BlockAction, StaticSelectAction } from "@slack/bolt";
import { scopeSelectAction, reminderCommandName } from "./constant";
import { configurationBlocks, ConfigurationModal } from "./views";
import { getChannelConfiguration } from "../../../shared/reminder-setting/get-config";

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
    configModal.addBlock(configurationBlocks(config));
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: configModal.build(),
    });
  });
};

export const reminderSettingHandler = async (app: App) => {
  scopeSelectHandler(app);
  configReminderHandler(app);
};
