import { WebClient } from "@slack/web-api";
import { ITeamConversation } from "../../../../common/models/team";

export const conversationMembers = async (client: WebClient, conversationId: string) => {
  const res = await client.conversations.members({
    channel: conversationId,
  });

  if (!res.ok) {
    throw new Error(`error in getting conversation members: ${res.error}`);
  }

  return res.members;
};

export const createTeamConversations = async (
  client: WebClient,
  conversationId: string,
): Promise<ITeamConversation> => {
  const members = await conversationMembers(client, conversationId);

  if (!members) {
    throw new Error(`error in getting conversation members: ${members}`);
  }

  return {
    conversationId,
    members,
  };
};
