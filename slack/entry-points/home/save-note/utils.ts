import { ViewOutput } from "@slack/bolt";
import { IThread, ThreadDetails, threadRepo } from "../../../../common/models/thread";
import { viewInputReader, stringInputParser } from "../../../utils";
import { SaveThreadViewOuput } from "../../save-chat/utils";

export const saveFromSaveNoteView = async ({
  view,
  orgId,
  userId,
  userName,
}: {
  view: ViewOutput;
  orgId: string;
  userId: string;
  userName: string;
}) => {
  const values = viewInputReader<SaveThreadViewOuput>(view);
  const teams = values.teams?.selected_options?.map((option) => option.value) || [];
  const title = stringInputParser(values.title);
  const description = stringInputParser(values.description);
  const thread: IThread & ThreadDetails = {
    userId: userId,
    userName: userName,
    messageTs: "",
    orgId: orgId,
    domain: "",
    threadLink: "",
    channelId: "",
    isSaved: false,
    isReply: false,
    isNote: true,
    title,
    teams: teams,
    description,
  };
  return thread;
};
