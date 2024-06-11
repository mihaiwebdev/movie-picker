interface WatchProviderInterface {
  [key: string]: {
    flatrate?: [
      {
        provider_id: number;
        provider_name: string;
      },
    ];
  };
}

export interface WatchProvidersResponse {
  id: number;
  results: WatchProviderInterface;
}
