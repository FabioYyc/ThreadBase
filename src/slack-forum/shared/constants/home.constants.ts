import { CategoryBlockRetriever } from "../../handlers/home/blocks-retrievers/category.retriever";
import { TopicBlocksRetriever } from "../../handlers/home/blocks-retrievers/topic.retriever";

export const HomeActionIds = {
  ManageCategoryActionId: "manage_category_action",
  ManageTopicActionId: "manage_topic_action",
};

export const HomeActionBlockId = "home_actions";

export const HomeActionTitleBlockId = "action_title";

export type HomeActions = "category" | "topic";

export const BlockRetrieverMap: {
  [key in HomeActions]: {
    retrieverClass: any;
    homeActionId: string;
  };
} = {
  category: {
    retrieverClass: CategoryBlockRetriever,
    homeActionId: HomeActionIds.ManageCategoryActionId,
  },
  topic: {
    retrieverClass: TopicBlocksRetriever,
    homeActionId: HomeActionIds.ManageTopicActionId,
  },
};
