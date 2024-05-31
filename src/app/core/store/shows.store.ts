import { Injectable, computed, signal } from '@angular/core';
import { ShowTypesEnum } from '../../shared/enums/show-types.enum';
import { GenreInterface } from '../../shared/types/genres-response.interface';
import { StreamingPlatformsInterface } from '../../shared/types/show-platforms.interface';
import { ShowInterface } from '../../shared/types/show-response.interface';
import { ShowBookmarkInterface } from '../../shared/types/show-bookmark.interface';

@Injectable({
  providedIn: 'root',
})
export class ShowsStore {
  private readonly state = {
    $showsResults: signal<ShowInterface[] | null>(null),
    $selectedShow: signal<ShowInterface | null>(null),
    $selectedPlatforms: signal<StreamingPlatformsInterface[]>([]),
    $selectedGenres: signal<GenreInterface[]>([]),
    $selectedShowType: signal<ShowTypesEnum>(ShowTypesEnum.movie),
    $watchedShows: signal<ShowBookmarkInterface[]>([]),
    $resultPages: signal(0),
  };
  public readonly $selectedShow = this.state.$selectedShow.asReadonly();
  public readonly $selectedPlatforms =
    this.state.$selectedPlatforms.asReadonly();
  public readonly $selectedGenres = this.state.$selectedGenres.asReadonly();
  public readonly $selectedShowType = this.state.$selectedShowType.asReadonly();
  public readonly $showsResults = this.state.$showsResults.asReadonly();
  public readonly $watchedShows = this.state.$watchedShows.asReadonly();
  public readonly $resultsPages = this.state.$resultPages.asReadonly();
  public readonly $currentShowIndex = computed(() =>
    this.$showsResults()?.indexOf(
      this.$selectedShow() || ({} as ShowInterface),
    ),
  );

  public setSelectedShow(show: ShowInterface) {
    this.state.$selectedShow.set(show);
  }
  public setStreamingPlatforms(platforms: StreamingPlatformsInterface[]) {
    this.state.$selectedPlatforms.set(platforms);
  }
  public setShowsResults(showResults: ShowInterface[]) {
    this.state.$showsResults.set(showResults);
  }
  public updateShowsResults(showResults: ShowInterface[]) {
    this.state.$showsResults.update((value) => [
      ...(value || []),
      ...showResults,
    ]);
  }
  public setSelectedGenres(genres: GenreInterface[]) {
    this.state.$selectedGenres.set(genres);
  }
  public setSelectedShowType(showType: ShowTypesEnum) {
    this.state.$selectedShowType.set(showType);
  }
  public setWatchedShows(watchedShows: ShowBookmarkInterface[]) {
    this.state.$watchedShows.set(watchedShows);
  }
  public setResultPages(pages: number) {
    this.state.$resultPages.set(pages);
  }
}
