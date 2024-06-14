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
  public readonly $isLiked = signal(false);
  public readonly $isLikedLoading = signal(false);
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
  public readonly $isLoginVisibile = signal(false);
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

    this.checkShowBookmark(BookmarksEnum.liked);
    this.checkShowBookmark(BookmarksEnum.watched);
    this.checkShowBookmark(BookmarksEnum.watchlist);
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
    if (!this.$selectedShow()?.id) return;
    if (!this.$currentUser()?.uid) {
      this.$isLoginVisibile.set(true);
      return;
    }

    if (bookmarkType === BookmarksEnum.watchlist) {
      this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.liked) {
      this.$isLikedLoading.set(true);
    }

    this.removeFromBookmark(bookmarkType)
      .pipe(
        tap(() => {
          bookmarkType === BookmarksEnum.watchlist
            ? this.$isInWatchlist.set(false)
            : bookmarkType === BookmarksEnum.watched
              ? this.$isWatched.set(false)
              : this.$isLiked.set(false);
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
          this.$isLikedLoading.set(false);
        }),
      )
      .subscribe();
  }

  public addShowToBookmarks(bookmarkType: BookmarksEnum) {
    if (!this.$selectedShow()?.id) return;
    if (!this.$currentUser()?.uid) {
      this.$isLoginVisibile.set(true);
      return;
    }

    if (bookmarkType === BookmarksEnum.watchlist) {
      this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.liked) {
      this.$isLikedLoading.set(true);
    }
    const listName =
      bookmarkType === BookmarksEnum.liked
        ? 'more like this list'
        : bookmarkType === BookmarksEnum.watched
          ? 'hide list'
          : 'watch list';

    this.addToBookmark(bookmarkType)
      .pipe(
        tap(() => {
          bookmarkType === BookmarksEnum.watchlist
            ? this.$isInWatchlist.set(true)
            : bookmarkType === BookmarksEnum.watched
              ? this.$isWatched.set(true)
              : this.$isLiked.set(true);

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
          this.$isLikedLoading.set(false);
        }),
      )
      .subscribe();
  }

  public nextShow(prev: boolean, next: boolean) {
    if (!this.$showsResults()) {
      return;
    }
    this.$isLoginVisibile.set(false);
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

    this.checkShowBookmark(BookmarksEnum.liked);
    this.checkShowBookmark(BookmarksEnum.watched);
    this.checkShowBookmark(BookmarksEnum.watchlist);
  }

  private checkShowBookmark(bookmarkType: BookmarksEnum) {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;
    if (bookmarkType === BookmarksEnum.watchlist) {
      this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.liked) {
      this.$isLikedLoading.set(true);
    }

    this.getFromBookmarks(bookmarkType)
      .pipe(
        tap((response) => {
          if (response.data()) {
            bookmarkType === BookmarksEnum.watchlist
              ? this.$isInWatchlist.set(true)
              : bookmarkType === BookmarksEnum.watched
                ? this.$isWatched.set(true)
                : this.$isLiked.set(true);
          } else {
            bookmarkType === BookmarksEnum.watchlist
              ? this.$isInWatchlist.set(false)
              : bookmarkType === BookmarksEnum.watched
                ? this.$isWatched.set(false)
                : this.$isLiked.set(false);
          }
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not check if show is in the ${bookmarkType} collection`,
          });
          return of(error);
        }),
        finalize(() => {
          this.$isWatchlistLoading.set(false);
          this.$isWatchedLoading.set(false);
          this.$isLikedLoading.set(false);
        }),
      )
      .subscribe();
  }

  private addToBookmark(bookmarkType: BookmarksEnum) {
    if (bookmarkType === BookmarksEnum.watchlist) {
      return this.showsService.addToWatchlist(
        String(this.$selectedShow()!.id),
        this.$selectedShow()!,
        this.$currentUser()!.uid,
      );
    }
    if (bookmarkType === BookmarksEnum.watched) {
      return this.showsService.addToWatchedShows(
        String(this.$selectedShow()!.id),
        this.$selectedShow()!,
        this.$currentUser()!.uid,
      );
    }
    return this.showsService.addToLiked(
      String(this.$selectedShow()!.id),
      this.$selectedShow()!,
      this.$currentUser()!.uid,
    );
  }

  private removeFromBookmark(bookmarkType: BookmarksEnum) {
    if (bookmarkType === BookmarksEnum.watchlist) {
      return this.showsService.removeFromWatchlist(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      );
    }
    if (bookmarkType === BookmarksEnum.watched) {
      return this.showsService.removeFromWatchedShows(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      );
    }
    return this.showsService.removeFromLiked(
      String(this.$selectedShow()!.id),
      this.$currentUser()!.uid,
    );
  }

  private getFromBookmarks(bookmarkType: BookmarksEnum) {
    if (bookmarkType === BookmarksEnum.watchlist) {
      return this.showsService.getFromWatchlist(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      );
    }
    if (bookmarkType === BookmarksEnum.watched) {
      return this.showsService.getFromWatchedShows(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      );
    }
    return this.showsService.getFromLiked(
      String(this.$selectedShow()!.id),
      this.$currentUser()!.uid,
    );
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
