import { Block, Button, KnownBlock, View } from "@slack/bolt";
import { editNoteCallbackId, saveNoteActionId, saveNoteCallbackId } from "./constant";
import { ISavedThread } from "../../../../common/models/thread";
import { getTeamMultiSelect } from "../../save-chat/views";
import { getTeamsForUser } from "../teams/utils";

export const saveNoteButton: Button = {
  type: "button",
  text: {
    type: "plain_text",
    text: "New Note",
    emoji: true,
  },
  action_id: saveNoteActionId,
};

export const createNoteView = async ({
  externalId,
  thread,
  isEdit = false,
  userId,
  orgId,
  callbackIdOverride,
}: {
  externalId?: string;
  isEdit?: boolean;
  thread?: ISavedThread;
  userId: string;
  orgId: string;
  callbackIdOverride?: string;
}): Promise<View> => {
  if (isEdit && !thread) {
    throw new Error("Missing thread");
  }

  const teams = await getTeamsForUser(orgId, userId);
  const blocks: (Block | KnownBlock)[] = [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Add more details to this note to refer back later! :brain:",
        emoji: true,
      },
    },
    {
      type: "divider",
    },
    {
      type: "input",
      block_id: "title",
      label: {
        type: "plain_text",
        text: "What's this note about? :thinking_face:",
        emoji: true,
      },
      element: {
        type: "plain_text_input",
        multiline: false,
        placeholder: {
          type: "plain_text",
          text: "Give a short title for the note",
          emoji: true,
        },
        initial_value: isEdit ? thread?.title : undefined,
      },
    },
    {
      type: "input",
      block_id: "content",
      label: {
        type: "plain_text",
        text: "Content",
        emoji: true,
      },
      element: {
        type: "plain_text_input",
        multiline: true,
        placeholder: {
          type: "plain_text",
          text: "Write the content of the note here...",
          emoji: true,
        },
        initial_value: isEdit ? thread?.description : undefined,
      },
      optional: true,
    },
  ];
  let teamMultiSelect;
  if (teams && teams.length > 0) {
    const initial_options = isEdit ? thread?.teams?.map((team) => team) : undefined;
    teamMultiSelect = getTeamMultiSelect(teams, initial_options);
    blocks.push(teamMultiSelect);
  }

  let callbackId = isEdit ? editNoteCallbackId : saveNoteCallbackId;
  if (callbackIdOverride) {
    callbackId = callbackIdOverride;
  }

  return {
    type: "modal",
    callback_id: callbackId,
    external_id: externalId,
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    title: {
      type: "plain_text",
      text: "Save this note :memo:",
      emoji: true,
    },
    blocks: blocks,
  };
};
