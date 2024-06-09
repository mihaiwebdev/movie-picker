import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { Observable, from, map, of, switchMap, tap } from 'rxjs';
import { ConfigurationService, ShowsStore } from '..';
import { environment } from '../../../environments/environment.development';
import {
  ShowInterface,
  ShowResponseInterface,
  ShowTypesEnum,
} from '../../shared';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root',
})
export class ShowsService {
  private readonly http = inject(HttpClient);
  private readonly userDataService = inject(UserDataService);
  private readonly showsStore = inject(ShowsStore);
  private readonly configService = inject(ConfigurationService);

  private readonly tmdbApi = environment.tmdbApiUrl;
  private readonly db = this.configService.db;
  private readonly usersCollection = 'users';
  private readonly watchedlistCollection = 'watchedlist';
  private readonly watchlistCollection = 'watchlist';
  private readonly blacklistCollection = 'blacklist';

  private readonly $userLocation = this.userDataService.$userLocation;
  private readonly $currentUser = this.userDataService.$currentUser;

  // Saved Shows / Watchlist
  public addToWatchlist(
    showId: string,
    showData: ShowInterface,
    userId: string,
  ) {
    return from(
      setDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchlistCollection,
          showId,
        ),
        showData,
      ),
    );
  }

  public removeFromWatchlist(showId: string, userId: string) {
    return from(
      deleteDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchlistCollection,
          showId,
        ),
      ),
    );
  }

  public getAllFromWatchlist(userId: string) {
    return from(
      getDocs(
        collection(
          this.db,
          this.usersCollection,
          userId,
          this.watchlistCollection,
        ),
      ),
    );
  }

  public getFromWatchlist(showId: string, userId: string) {
    return from(
      getDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchlistCollection,
          showId,
        ),
      ),
    );
  }

  // Watched Shows
  public addToWatchedShows(
    showId: string,
    showData: ShowInterface,
    userId: string,
  ) {
    return from(
      setDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchedlistCollection,
          showId,
        ),
        showData,
      ),
    );
  }

  public removeFromWatchedShows(showId: string, userId: string) {
    return from(
      deleteDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchedlistCollection,
          showId,
        ),
      ),
    );
  }

  public getAllWatchedShows(userId: string) {
    return from(
      getDocs(
        collection(
          this.db,
          this.usersCollection,
          userId,
          this.watchedlistCollection,
        ),
      ),
    );
  }

  public getFromWatchedShows(showId: string, userId: string) {
    return from(
      getDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.watchedlistCollection,
          showId,
        ),
      ),
    );
  }

  // Hidden shows
  public addToHidden(showId: string, showData: ShowInterface, userId: string) {
    return from(
      setDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.blacklistCollection,
          showId,
        ),
        showData,
      ),
    );
  }

  public removeFromHidden(showId: string, userId: string) {
    return from(
      deleteDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.blacklistCollection,
          showId,
        ),
      ),
    );
  }

  public getAllHidden(userId: string) {
    return from(
      getDocs(
        collection(
          this.db,
          this.usersCollection,
          userId,
          this.blacklistCollection,
        ),
      ),
    );
  }

  public getFromHidden(showId: string, userId: string) {
    return from(
      getDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.blacklistCollection,
          showId,
        ),
      ),
    );
  }

  // Get trending shows
  public getTrendingShows(showType: ShowTypesEnum) {
    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/trending/${showType}/day?language=en-US`,
    );
  }

  public getShow(showType: string, showName: string) {
    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/search/${showType}?query=${showName}`,
    );
  }

  // Get Shows Algo
  public getShows(page: number): Observable<ShowInterface[]> {
    const watchProviders = this.getWatchProviders();
    const genresIds = this.getGenreIds();
    const joinedGenres = genresIds.join(',');

    return this.http
      .get<ShowResponseInterface>(
        `${this.tmdbApi}/discover/${this.showsStore.$selectedShowType()}?language=en-US&page=${page}&sort_by=vote_count.desc&watch_region=${this.$userLocation()?.country || 'US'}&with_genres=${joinedGenres}&with_watch_providers=${watchProviders}`,
      )
      .pipe(
        tap((res) => this.showsStore.setResultPages(res.total_pages)),
        map((res) => res.results),
        switchMap((res) => {
          return this.$currentUser()?.uid
            ? this.filterWatchedShows(res)
            : of(res);
        }),
        switchMap((res) => {
          return this.$currentUser()?.uid
            ? this.filterSavedShows(res)
            : of(res);
        }),
        switchMap((res) => {
          return this.$currentUser()?.uid
            ? this.filterHiddenShows(res)
            : of(res);
        }),
        map(this.sortShowsByScore.bind(this)),
        switchMap((res) => {
          return res.length < 1 ? this.getShows(page + 1) : of(res);
        }),
      );
  }

  private sortShowsByScore(res: ShowInterface[]) {
    const genresIds = this.getGenreIds();

    res.sort((a, b) => {
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

    this.filterAnimations(genresIds, res);

    return res;
  }

  private getWatchProviders() {
    return this.showsStore
      .$selectedPlatforms()
      .map((platform) => platform.provider_id)
      .join('|');
  }

  private getGenreIds() {
    return this.showsStore.$selectedGenres().map((genre) => genre.id);
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

  private filterWatchedShows(res: ShowInterface[]) {
    return this.getAllWatchedShows(this.$currentUser()!.uid).pipe(
      map((watchedShows) => {
        const watchedShowsIds = new Set();

        watchedShows.forEach((doc) => watchedShowsIds.add(doc.data()['id']));

        return res.filter((show) => !watchedShowsIds.has(show.id));
      }),
    );
  }

  private filterHiddenShows(res: ShowInterface[]) {
    return this.getAllHidden(this.$currentUser()!.uid).pipe(
      map((hiddenShow) => {
        const hiddenShowsIds = new Set();

        hiddenShow.forEach((doc) => hiddenShowsIds.add(doc.data()['id']));

        return res.filter((show) => !hiddenShowsIds.has(show.id));
      }),
    );
  }

  private filterSavedShows(res: ShowInterface[]) {
    return this.getAllFromWatchlist(this.$currentUser()!.uid).pipe(
      map((watchlist) => {
        const watchListShowIds = new Set();

        watchlist.forEach((doc) => watchListShowIds.add(doc.data()['id']));

        return res.filter((show) => !watchListShowIds.has(show.id));
      }),
    );
  }

  private filterAnimations(genres: number[], results: ShowInterface[]) {
    if (!genres.includes(16)) {
      return results.filter((result) => !result.genre_ids.includes(16));
    } else {
      return results;
    }
  }
}
