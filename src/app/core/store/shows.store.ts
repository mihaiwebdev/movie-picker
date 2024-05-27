import { Injectable, signal } from '@angular/core';
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
  };
  public readonly $selectedShow = this.state.$selectedShow.asReadonly();
  public readonly $selectedPlatforms =
    this.state.$selectedPlatforms.asReadonly();
  public readonly $selectedGenres = this.state.$selectedGenres.asReadonly();
  public readonly $selectedShowType = this.state.$selectedShowType.asReadonly();
  public readonly $showsResults = this.state.$showsResults.asReadonly();
  public readonly $watchedShows = this.state.$watchedShows.asReadonly();

  public setSelectedShow(show: ShowInterface) {
    this.state.$selectedShow.set(show);
  }
  public setStreamingPlatforms(platforms: StreamingPlatformsInterface[]) {
    this.state.$selectedPlatforms.set(platforms);
  }
  public setShowsResults(showResults: ShowInterface[]) {
    this.state.$showsResults.set(showResults);
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

  public nextShow() {
    let idx = 0;
    if (this.$selectedShow()) {
      idx = this.$showsResults()?.indexOf(this.$selectedShow()!) || 0;
    }

    return (prev: boolean, next: boolean) => {
      if (!this.$showsResults()) return;

      if (next && idx < this.$showsResults()!.length - 1) {
        idx++;

        this.state.$selectedShow.set(this.$showsResults()![idx]);
      }

      if (prev && idx > 0) {
        idx--;
        this.state.$selectedShow.set(this.$showsResults()![idx]);
      }

      return idx;
    };
  }
}
