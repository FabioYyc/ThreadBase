export type linkedChannel = {
  name: string;
  id: string;
};
export type Category = {
  name: string;
  id: string;
  linkedChannel?: linkedChannel[];
};
