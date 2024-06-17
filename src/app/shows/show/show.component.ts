import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, of, tap } from 'rxjs';
import { BookmarksEnum } from '../../bookmarks/bookmarks.enum';
import {
  LoaderService,
  ShowsService,
  UserDataService,
  movieGenres,
  tvGenres,
} from '../../core';
import { ShowsStore } from '../../core/store/shows.store';
import { GenreInterface, ReadMoreDirective, ShowTypesEnum } from '../../shared';
import { VideoComponent } from '../video/video.component';

export interface MovieMetadataInterface {
  status: BookmarksEnum;
}

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [RouterLink, ReadMoreDirective, RippleModule, VideoComponent],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly showsStore = inject(ShowsStore);
  private readonly showsService = inject(ShowsService);
  private readonly messageService = inject(MessageService);
  private readonly userDataService = inject(UserDataService);
  private readonly loaderService = inject(LoaderService);
  private readonly location = inject(Location);
  private readonly allGenres = [...movieGenres, ...tvGenres];
  private trendingShow?: ShowTypesEnum | null;

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/original';
  public readonly $selectedShow = this.showsStore.$selectedShow;
  public readonly $showsResults = this.showsStore.$showsResults;
  public readonly $resultsPages = this.showsStore.$resultsPages;
  public readonly $showGenres = computed(
    () => this.$selectedShow()?.genre_ids && this.getShowGenres(),
  );

  public readonly $isImgLoading = signal(true);
  public readonly $isWatched = signal(false);
  public readonly $isWatchedLoading = signal(false);
  public readonly $isInWatchlist = signal(false);
  public readonly $isWatchlistLoading = signal(false);
  public readonly $isHidden = signal(false);
  public readonly $isHideLoading = signal(false);
  public readonly $isProviderLoading = signal(false);
  public readonly $watchProvider = signal<string>('');

  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $page = signal(1);
  public readonly $showIdx = signal(this.showsStore.$currentShowIndex() || 0);
  public readonly $isPrevBtn = computed(() => this.$showIdx() > 0);
  public readonly $isNextBtn = computed(() =>
    this.$showsResults()
      ? this.$showIdx() !== this.$showsResults()!.length - 1 ||
        this.$page() !== this.$resultsPages()
      : false,
  );
  public readonly $isWatchlistLogin = signal(false);
  public readonly $isWatchedLogin = signal(false);
  public readonly $isHideLogin = signal(false);

  public readonly $isMovie = computed(() =>
    this.$selectedShow()?.title ? true : false,
  );
  public readonly $isTrailerVisibile = signal(false);
  public readonly $isDesktopTrailerVisible = signal(false);
  public readonly bookmarksTypeEnum = BookmarksEnum;

  ngOnInit(): void {
    if (!this.$selectedShow()) {
      this.router.navigate(['/', 'app']);
      return;
    }

    this.trendingShow = this.activatedRoute.snapshot.queryParamMap.get(
      'trending',
    ) as ShowTypesEnum;

    this.checkShowBookmark();
    this.getShowWatchProviders();
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  public goBack() {
    this.location.back();
  }

  public toggleTrailer() {
    this.$isTrailerVisibile.update((state) => !state);
  }
  public toggleDesktopTrailer() {
    this.$isDesktopTrailerVisible.update((state) => !state);
  }

  public getReleaseDate() {
    return (
      this.$selectedShow()?.release_date || this.$selectedShow()?.first_air_date
    )?.split('-')[0];
  }

  public removeFromBookmarks(bookmarkType: BookmarksEnum) {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;

    if (bookmarkType === BookmarksEnum.watchlist) {
      this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.hidden) {
      this.$isHideLoading.set(true);
    }

    this.showsService
      .removeShow(
        String(this.$selectedShow()?.id),
        String(this.$currentUser()?.uid),
        bookmarkType,
      )
      .pipe(
        tap(() => {
          bookmarkType === BookmarksEnum.watchlist
            ? this.$isInWatchlist.set(false)
            : bookmarkType === BookmarksEnum.watched
              ? this.$isWatched.set(false)
              : this.$isHidden.set(false);
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not remove from ${bookmarkType}`,
          });
          return of(error);
        }),
        finalize(() => {
          this.$isWatchlistLoading.set(false);
          this.$isWatchedLoading.set(false);
          this.$isHideLoading.set(false);
        }),
      )
      .subscribe();
  }

  public addShowToBookmarks(bookmarkType: BookmarksEnum) {
    if (!this.$selectedShow()?.id) return;

    this.bookmarkTypeCheckOnAdd(bookmarkType);

    if (!this.$currentUser()?.uid) {
      return;
    }

    const listName =
      bookmarkType === BookmarksEnum.hidden
        ? 'stop recommending list'
        : bookmarkType === BookmarksEnum.watched
          ? 'watched list'
          : 'watchlist';

    this.showsService
      .addShow(
        String(this.$selectedShow()!.id),
        this.$selectedShow()!,
        this.$currentUser()!.uid,
        bookmarkType,
      )
      .pipe(
        tap(() => {
          this.$isInWatchlist.set(false);
          this.$isWatched.set(false);
          this.$isHidden.set(false);

          bookmarkType === BookmarksEnum.watchlist
            ? this.$isInWatchlist.set(true)
            : bookmarkType === BookmarksEnum.watched
              ? this.$isWatched.set(true)
              : this.$isHidden.set(true);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Show was added in ${listName}!`,
          });
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not add to ${bookmarkType}`,
          });
          return of(error);
        }),
        finalize(() => {
          this.$isWatchlistLoading.set(false);
          this.$isWatchedLoading.set(false);
          this.$isHideLoading.set(false);
        }),
      )
      .subscribe();
  }

  public nextShow(prev: boolean, next: boolean) {
    if (!this.$showsResults()) {
      return;
    }
    this.$isHideLogin.set(false);
    this.$isWatchedLogin.set(false);
    this.$isWatchlistLogin.set(false);
    this.$isImgLoading.set(true);

    if (prev) this.$showIdx.update((val) => --val);
    if (next) this.$showIdx.update((val) => ++val);

    if (
      this.$showIdx() === this.$showsResults()!.length &&
      this.$page() < this.$resultsPages()
    ) {
      this.$page.update((val) => ++val);

      if (this.trendingShow) {
        this.getTrendingShows();
      } else {
        this.getShows();
      }
    } else {
      this.showsStore.setSelectedShow(this.$showsResults()![this.$showIdx()]);
    }

    this.checkShowBookmark();
    this.getShowWatchProviders();
  }

  private getShowWatchProviders() {
    this.$isProviderLoading.set(true);

    if (!this.$selectedShow()?.id) return;

    const showType = (this.$isMovie() ? 'movie' : 'tv') as ShowTypesEnum;
    this.showsService
      .getShowWatchProviders(showType, this.$selectedShow()!.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((respone) => {
          this.$watchProvider.set(respone);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not get watch provider`,
          });
          return of(err);
        }),
        finalize(() => this.$isProviderLoading.set(false)),
      )
      .subscribe();
  }

  private checkShowBookmark() {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;

    this.$isWatchlistLoading.set(true);
    this.$isWatchedLoading.set(true);
    this.$isHideLoading.set(true);

    this.showsService
      .getFromMetadata(
        String(this.$selectedShow()?.id),
        this.$currentUser()!.uid,
      )
      .pipe(
        tap((response) => {
          this.$isInWatchlist.set(false);
          this.$isWatched.set(false);
          this.$isHidden.set(false);

          const movieMetadata = response.data() as MovieMetadataInterface;
          if (movieMetadata) {
            const status = movieMetadata.status;

            status === BookmarksEnum.watchlist
              ? this.$isInWatchlist.set(true)
              : status === BookmarksEnum.watched
                ? this.$isWatched.set(true)
                : this.$isHidden.set(true);
          }
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not check if show is in the collection`,
          });
          return of(error);
        }),
        finalize(() => {
          this.$isWatchlistLoading.set(false);
          this.$isWatchedLoading.set(false);
          this.$isHideLoading.set(false);
        }),
      )
      .subscribe();
  }

  private bookmarkTypeCheckOnAdd(bookmarkType: BookmarksEnum) {
    if (bookmarkType === BookmarksEnum.watchlist) {
      !this.$currentUser()?.uid
        ? this.$isWatchlistLogin.set(true)
        : this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      !this.$currentUser()?.uid
        ? this.$isWatchedLogin.set(true)
        : this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.hidden) {
      !this.$currentUser()?.uid
        ? this.$isHideLogin.set(true)
        : this.$isHideLoading.set(true);
    }
  }

  private getShows() {
    this.loaderService.setIsLoading(true);

    this.showsService
      .getShows(this.$page())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.showsStore.setSelectedShow(res[0]);
          this.showsStore.updateShowsResults(res);
        }),
        finalize(() => {
          this.loaderService.setIsLoading(false);
        }),
      )
      .subscribe();
  }

  private getTrendingShows() {
    if (!this.trendingShow) return;

    this.loaderService.setIsLoading(true);

    this.showsService
      .getTrendingShows(this.trendingShow, this.$page())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.showsStore.setResultPages(res.total_results);
          this.showsStore.updateShowsResults(res.results);
          this.showsStore.setSelectedShow(res.results[0]);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get the shows',
          });
          return of(err);
        }),
        finalize(() => this.loaderService.setIsLoading(false)),
      )
      .subscribe();
  }

  private getShowGenres(): GenreInterface[] {
    let showGenres: GenreInterface[] = [];

    for (let genreId of this.$selectedShow()!.genre_ids) {
      const genre = this.allGenres.find((genre) => genre.id === genreId);
      genre && showGenres.push(genre);
    }

    return showGenres;
  }
}

export default ShowComponent;
