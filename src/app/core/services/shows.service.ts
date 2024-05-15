import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { ShowInterface, ShowResponseInterface, ShowTypesEnum } from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ShowsService {
  private readonly http = inject(HttpClient);
  private readonly tmdbApi = environment.tmdbApiUrl;

  private readonly state = {
    $showsResults: signal<ShowResponseInterface | null>(null),
    $selectedShow: signal<ShowInterface | null>(null),
  };
  public readonly $selectedShow = this.state.$selectedShow.asReadonly();

  public getShows(
    showType: string,
    page: number,
    watchRegion: string,
    genres: number[],
    watchProviders: number[],
  ) {
    const joinedWatchProviders = watchProviders.join('|');
    const joinedGenres = genres.join(',');

    return this.http
      .get<ShowResponseInterface>(
        `${this.tmdbApi}/discover/${showType}?language=en-US&page=${page}&sort_by=popularity.desc&watch_region=${watchRegion}&with_genres=${joinedGenres}&with_watch_providers=${joinedWatchProviders}`,
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

          return res;
        }),
        tap((res) => {
          this.state.$showsResults.set(res);
          this.setSelectedShow(res.results[0]);
        }),
      );
  }

  public setSelectedShow(show: ShowInterface) {
    this.state.$selectedShow.set(show);
  }

  public getTrendingShows(showType: ShowTypesEnum) {
    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/trending/${showType}/day?language=en-US`,
    );
  }

  private calculateWeightedWilsonScore(
    voteCount: number,
    voteAverage: number,
  ): number {
    // Constants
    const zScore = 1.96; // Z-score for 95% confidence level
    const weight = 0.9;

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
}
