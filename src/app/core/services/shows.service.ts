import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { Observable, from, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ConfigurationService, ShowsStore } from '..';
import { environment } from '../../../environments/environment.development';
import { BookmarksEnum } from '../../bookmarks/bookmarks.enum';
import {
  ShowInterface,
  ShowResponseInterface,
  ShowTypesEnum,
  WatchProvidersResponse,
} from '../../shared';
import { StreamingPlatformsResultInterface } from '../../shared/types/show-platforms.interface';
import { ShowVideoResponseInterface } from '../../shared/types/show-video-response.interface';
import { WatchProviderInterface } from '../../shared/types/watch-providers-response.interface';
import { MovieMetadataInterface } from '../../shows/show/show.component';
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
  private readonly hiddenShowsCollection = 'hidden';
  private readonly movieMetadataCollection = 'movieMetadata';

  private readonly $userLocation = this.userDataService.$userLocation;
  private readonly $currentUser = this.userDataService.$currentUser;

  // ~~~ Firestore API

  // Add show to collection
  public addShow(
    showId: string,
    showData: ShowInterface,
    userId: string,
    status: BookmarksEnum,
  ) {
    const batch = writeBatch(this.db);

    // Reference to movieMetadata document
    const movieMetadataRef = doc(
      this.db,
      this.usersCollection,
      userId,
      this.movieMetadataCollection,
      showId,
    );

    // Reference to all collections
    const watchlistRef = doc(
      this.db,
      this.usersCollection,
      userId,
      this.watchlistCollection,
      showId,
    );
    const watchedRef = doc(
      this.db,
      this.usersCollection,
      userId,
      this.watchedlistCollection,
      showId,
    );
    const hiddenRef = doc(
      this.db,
      this.usersCollection,
      userId,
      this.hiddenShowsCollection,
      showId,
    );

    const getStatusRef = (status: BookmarksEnum) => {
      return status === BookmarksEnum.watchlist
        ? watchlistRef
        : status === BookmarksEnum.watched
          ? watchedRef
          : hiddenRef;
    };

    // Commit the batch
    return from(getDoc(movieMetadataRef)).pipe(
      mergeMap((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as MovieMetadataInterface;
          if (data.status !== status) {
            const existingStatusRef = getStatusRef(data.status);
            batch.delete(existingStatusRef);
          }
        }

        // Set movie metadata with status
        batch.set(movieMetadataRef, { status: status });

        const newStatusRef = getStatusRef(status);
        // Set movie data in the specific collection
        batch.set(newStatusRef, showData);

        return from(batch.commit());
      }),
    );
  }

  public getFromMetadata(showId: string, userId: string) {
    return from(
      getDoc(
        doc(
          this.db,
          this.usersCollection,
          userId,
          this.movieMetadataCollection,
          showId,
        ),
      ),
    );
  }

  // Remove show
  public removeShow(showId: string, userId: string, status: BookmarksEnum) {
    const batch = writeBatch(this.db);

    // Reference to movieMetadata document
    const movieMetadataRef = doc(
      this.db,
      this.usersCollection,
      userId,
      this.movieMetadataCollection,
      showId,
    );

    // Reference to the specific status collection document
    const statusCollection = this.getStatusCollection(status);
    const statusRef = doc(
      this.db,
      this.usersCollection,
      userId,
      statusCollection,
      showId,
    );

    batch.delete(movieMetadataRef);
    batch.delete(statusRef);

    return from(batch.commit());
  }

  // Saved Shows / Watchlist
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

  // Watched Shows
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

  // Hidden shows
  public getAllHidden(userId: string) {
    return from(
      getDocs(
        collection(
          this.db,
          this.usersCollection,
          userId,
          this.hiddenShowsCollection,
        ),
      ),
    );
  }

  public getStreamingPlatforms() {
    if (!this.$userLocation()) {
      return this.userDataService.getUserLocation().pipe(
        switchMap((userLocation) => {
          return this.http.get<StreamingPlatformsResultInterface>(
            `${this.tmdbApi}/watch/providers/movie?language=en-US&watch_region=${userLocation.country}`,
          );
        }),
        map((response) => response.results),
        map((platforms) =>
          platforms.filter((platform) => platform.display_priority < 50),
        ),
        map((platforms) =>
          platforms.sort((a, b) => a.display_priority - b.display_priority),
        ),
      );
    }

    return this.http
      .get<StreamingPlatformsResultInterface>(
        `${this.tmdbApi}/watch/providers/movie?language=en-US&watch_region=${this.$userLocation()?.country || 'US'}`,
      )
      .pipe(
        map((response) => response.results),
        map((platforms) =>
          platforms.filter((platform) => platform.display_priority < 50),
        ),
        map((platforms) =>
          platforms.sort((a, b) => a.display_priority - b.display_priority),
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
        map((response) => {
          return response.results.filter(
            (result) =>
              (result.type === 'Trailer' || result.type === 'Teaser') &&
              result.site === 'YouTube',
          );
        }),
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
            return resultProperty.flatrate
              .map((provider) => provider.provider_name)
              .join(', ');
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

  private filterHiddenShows(res: ShowInterface[]) {
    return this.getAllHidden(this.$currentUser()!.uid).pipe(
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

  private getStatusCollection(status: BookmarksEnum): string {
    switch (status) {
      case 'watchlist':
        return this.watchlistCollection;
      case 'watched':
        return this.watchedlistCollection;
      case 'hidden':
        return this.hiddenShowsCollection;
      default:
        throw new Error('Invalid status');
    }
  }
}
