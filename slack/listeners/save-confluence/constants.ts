export const confluenceDomainActionId = "confluence-domain";

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
