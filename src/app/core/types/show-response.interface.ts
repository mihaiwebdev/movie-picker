export interface ShowInterface {
  adult: boolean;
  backdrop_path: string;
  genres_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface ShowResponseInterface {
  page: number;
  results: ShowInterface[];
  total_pages: number;
  total_results: number;
}