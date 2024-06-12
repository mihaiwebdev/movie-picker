export interface ShowVideoInterface {
  site: string;
  type: string;
  official: boolean;
  key: string;
}

export interface ShowVideoResponseInterface {
  id: number;
  results: ShowVideoInterface[];
}
