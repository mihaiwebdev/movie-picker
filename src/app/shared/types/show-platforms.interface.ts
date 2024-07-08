export interface StreamingPlatformsInterface {
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface StreamingPlatformsResultInterface {
  results: StreamingPlatformsInterface[];
}
