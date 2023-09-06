export const confluenceDomainActionId = "confluence-domain";
export const saveConfluenceCallbackId = "save_to_confluence";
export const parentPageBlockId = "parent-page";
export const pageTitleBlockId = "title";
export const pageContentBlockId = "content";
export const saveConfluenceLogoutActionId = "logout";

export interface IPage {
  id: string;
  title: string;
  spaceId: string;
  paretnId: string;
}

export interface ISpace {
  id: string;
  key: string;
  name: string;
}

export type SaveConfluencePayload = {
  title: string;
  content: string;
  "parent-page": {
    type: string;
    selected_option: {
      value: string;
    };
  };
};

export interface ICreateCfPageRequestPayload {
  spaceId: string;
  parentId: string;
  title: string;
  body: {
    representation: "wiki";
    value: string;
  };
}

export interface ICreateCfPageResponse {
  title: string;
  _links: {
    webui: string;
  };
}
