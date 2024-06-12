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
  WatchProvidersResponse,
} from '../../shared';
import { ShowVideoResponseInterface } from '../../shared/types/show-video-response.interface';
import { WatchProviderInterface } from '../../shared/types/watch-providers-response.interface';
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
  private readonly likedShowsCollection = 'liked-shows';

  private readonly $userLocation = this.userDataService.$userLocation;
  private readonly $currentUser = this.userDataService.$currentUser;

  // ~~~ Firestore API

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

  // Liked shows
  public addToLiked(showId: string, showData: ShowInterface, userId: string) {
    return from(
      setDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.likedShowsCollection,
          showId,
        ),
        showData,
      ),
    );
  }

  public removeFromLiked(showId: string, userId: string) {
    return from(
      deleteDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.likedShowsCollection,
          showId,
        ),
      ),
    );
  }

  public getAllLiked(userId: string) {
    return from(
      getDocs(
        collection(
          this.db,
          this.usersCollection,
          userId,
          this.likedShowsCollection,
        ),
      ),
    );
  }

  public getFromLiked(showId: string, userId: string) {
    return from(
      getDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.likedShowsCollection,
          showId,
        ),
      ),
    );
  }

  // ~~~ Shows API
  public getShowVideo(showType: ShowTypesEnum, showId: number) {
    return this.http
      .get<ShowVideoResponseInterface>(
        `${this.tmdbApi}/${showType}/${showId}/videos?language=en-US`,
      )
      .pipe(
        map((response) =>
          response.results.filter(
            (result) => result.official && result.type === 'Trailer',
          ),
        ),
      );
  }

  public getShowWatchProviders(
    showType: ShowTypesEnum,
    showId: number,
  ): Observable<string> {
    return this.http
      .get<WatchProvidersResponse>(
        `${this.tmdbApi}/${showType}/${showId}/watch/providers`,
      )
      .pipe(
        map((response) => {
          const key = (this.$userLocation()?.country ||
            'US') as keyof WatchProviderInterface;

          const resultProperty = response.results[key];
          if (resultProperty && resultProperty.flatrate) {
            return resultProperty.flatrate[0].provider_name;
          }
          return '';
        }),
      );
  }

  // Search multi
  public searchMulti(value: string) {
    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/search/multi?query=${value}&language=en-US&page=1`,
    );
  }

  // Get trending shows
  public getTrendingShows(
    showType: ShowTypesEnum,
    page: number = 1,
  ): Observable<ShowResponseInterface> {
    const watchProviders = this.getWatchProviders();
    const path = `${showType}?language=en-US&page=${page}&sort_by=popularity.desc&watch_region=${this.$userLocation()?.country || 'US'}&with_watch_providers=${watchProviders}&without_genres=16`;

    return this.http.get<ShowResponseInterface>(
      `${this.tmdbApi}/discover/${path}`,
    );
  }

  // Search Show
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
    let path = `${this.showsStore.$selectedShowType()}?language=en-US&page=${page}&sort_by=vote_count.desc&watch_region=${this.$userLocation()?.country || 'US'}&with_genres=${joinedGenres}&with_watch_providers=${watchProviders}`;
    // Filter animations
    if (!genresIds.includes(16)) {
      path += '&without_genres=16';
    }

    return this.http
      .get<ShowResponseInterface>(`${this.tmdbApi}/discover/${path}`)
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
            ? this.filterLikedShows(res)
            : of(res);
        }),
        map(this.sortShowsByScore.bind(this)),
        switchMap((res) => {
          return res.length < 1 ? this.getShows(page + 1) : of(res);
        }),
      );
  }

  private sortShowsByScore(res: ShowInterface[]) {
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

  private filterLikedShows(res: ShowInterface[]) {
    return this.getAllLiked(this.$currentUser()!.uid).pipe(
      map((likedShow) => {
        const likedShowsIds = new Set();

        likedShow.forEach((doc) => likedShowsIds.add(doc.data()['id']));

        return res.filter((show) => !likedShowsIds.has(show.id));
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
}
