import { KnownBlock } from "@slack/bolt";
import { Topic } from "../../../types/Topic";
import { getTopicEntryBlock } from "../../../views/home/topic/topic.view";
import { AbstractHomeBlocks } from "./abstract-home-blocks-retriever";

export class TopicBlocksRetriever extends AbstractHomeBlocks {
  private async getCurrentTopics(orgId: string): Promise<Topic[]> {
    const testTopic: Topic = {
      name: "Test topic",
      id: "test-topic",
      description: "This is a test topic",
    };
    return [testTopic];
  }
  public async getBlocks(orgId: string): Promise<KnownBlock[]> {
    const topics = await this.getCurrentTopics(orgId);
    const blocks = topics.map((topic) => {
      return getTopicEntryBlock(topic);
    });
    return blocks;
  }
}
