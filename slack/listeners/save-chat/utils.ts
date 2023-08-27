import { ViewOutput } from "@slack/bolt";
import { threadRepo } from "../../../common/modles/thread";
import { stringInputParser, viewInputReader } from "../../utils";

export const keywordsParser = (keywords: string | null | undefined) => {
  if (!keywords) {
    return [];
  }
  return keywords.split(",");
};

export type SaveThreadViewOuput = {
  title: string;
  description?: string;
  teams: {
    selected_options?: Array<{ value: string }>;
  };
};

export const saveFromSaveChatView = async (view: ViewOutput) => {
  const values = viewInputReader<SaveThreadViewOuput>(view);
  const teams = values.teams.selected_options?.map((option) => option.value) || [];
  const threadDetails = {
    title: stringInputParser(values.title),
    description: stringInputParser(values.description),
    teams,
  };

  if (!view.external_id) {
    throw new Error("Missing external id");
  }
  const thread = await threadRepo.addDetailFields(threadDetails, view.external_id);
  if (!thread) {
    throw new Error("Thread not found");
  }
  return thread;
};
