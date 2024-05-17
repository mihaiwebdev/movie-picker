import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, map, tap } from 'rxjs';
import {
  ConfigurationService,
  GenreInterface,
  ShowInterface,
  ShowResponseInterface,
  ShowTypesEnum,
  StreamingPlatformsInterface,
} from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ShowsService {
  private readonly http = inject(HttpClient);
  private readonly configurationService = inject(ConfigurationService);
  private readonly tmdbApi = environment.tmdbApiUrl;

  private readonly state = {
    $showsResults: signal<ShowInterface[] | null>(null),
    $selectedShow: signal<ShowInterface | null>(null),
    $selectedPlatforms: signal<StreamingPlatformsInterface[]>([]),
    $selectedGenres: signal<GenreInterface[]>([]),
    $selectedShowType: signal<ShowTypesEnum>(ShowTypesEnum.movie),
    $userLocation: this.configurationService.$userLocation,
  };
  public readonly $selectedShow = this.state.$selectedShow.asReadonly();
  public readonly $selectedPlatforms =
    this.state.$selectedPlatforms.asReadonly();
  public readonly $selectedGenres = this.state.$selectedGenres.asReadonly();
  public readonly $selectedShowType = this.state.$selectedShowType.asReadonly();
  public readonly $showsResults = this.state.$showsResults.asReadonly();

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

  public nextShow() {
    let idx = 0;

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

  public getShows() {
    const observables = [];

    for (let i = 1; i <= 3; i++) {
      observables.push(this.getShowsObservable(i));
    }

    return forkJoin(observables).pipe(
      map((res) => res.flat()),
      tap((res) => {
        this.state.$showsResults.set(res);
        this.setSelectedShow(res[0]);
      }),
    );
  }

  public getTrendingShows(showType: ShowTypesEnum) {
    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/trending/${showType}/day?language=en-US`,
    );
  }

  private getShowsObservable(page: number) {
    const watchProviders = this.$selectedPlatforms()
      .map((platform) => platform.provider_id)
      .join('|');
    const genresIds = this.$selectedGenres().map((genre) => genre.id);
    const joinedGenres = genresIds.join(',');

    return this.http
      .get<ShowResponseInterface>(
        `${this.tmdbApi}/discover/${this.$selectedShowType()}?language=en-US&page=${page}&sort_by=vote_count.desc&watch_region=${this.state.$userLocation()?.country || 'US'}&with_genres=${joinedGenres}&with_watch_providers=${watchProviders}`,
      )
      .pipe(
        map((res) => {
          res.results.sort((a, b) => {
            const aScore = this.calculateWeightedWilsonScore(
              a.vote_count,
              a.vote_average,
            );
            const bScore = this.calculateWeightedWilsonScore(
              b.vote_count,
              b.vote_average,
            );

            return bScore - aScore;
          });

          res.results = this.filterAnimations(genresIds, res.results);

          return res.results;
        }),
      );
  }

  private calculateWeightedWilsonScore(
    voteCount: number,
    voteAverage: number,
  ): number {
    // Constants
    const zScore = 1.96; // Z-score for 95% confidence level
    const weight = 0.95;

    // Calculate proportion of positive ratings
    const positiveVotes = voteCount * (voteAverage / 10);

    // Wilson score interval
    const pHat = positiveVotes / voteCount;
    const wilsonScore =
      (pHat +
        Math.pow(zScore, 2) / (2 * voteCount) -
        zScore *
          Math.sqrt(
            (pHat * (1 - pHat) +
              Math.pow(zScore, 2) / (4 * Math.pow(voteCount, 2))) /
              voteCount,
          )) /
      (1 + Math.pow(zScore, 2) / voteCount);

    // Weighted Wilson score
    const weightedWilsonScore =
      weight * wilsonScore + (1 - weight) * (voteCount / 10000); // Adjusted to normalize vote count

    return weightedWilsonScore;
  }

  private filterAnimations(genres: number[], results: ShowInterface[]) {
    if (!genres.includes(16)) {
      return results.filter((result) => !result.genre_ids.includes(16));
    } else {
      return results;
    }
  }

  // TODO:
  private filterWatchedShows() {}

  // TODO:
  private filterSavedShows() {}
}
