import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, of, tap } from 'rxjs';
import {
  LoaderService,
  ShowsService,
  UserDataService,
  movieGenres,
  tvGenres,
} from '../../core';
import { ShowsStore } from '../../core/store/shows.store';
import { GenreInterface, ReadMoreDirective } from '../../shared';
import { BookmarksEnum } from '../../bookmarks/bookmarks.enum';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [RouterLink, ReadMoreDirective, RippleModule],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent {
  private readonly router = inject(Router);
  private readonly showsStore = inject(ShowsStore);
  private readonly showsService = inject(ShowsService);
  private readonly messageService = inject(MessageService);
  private readonly userDataService = inject(UserDataService);
  private readonly loaderService = inject(LoaderService);
  private readonly location = inject(Location);
  private readonly allGenres = [...movieGenres, ...tvGenres];

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
  public readonly $isHiddenLoading = signal(false);
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
  public readonly bookmarksTypeEnum = BookmarksEnum;

  ngOnInit(): void {
    if (!this.$selectedShow()) {
      this.router.navigate(['/', 'app']);
      return;
    }

    this.checkShowBookmark(BookmarksEnum.hidden);
    this.checkShowBookmark(BookmarksEnum.watched);
    this.checkShowBookmark(BookmarksEnum.watchlist);
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  public goBack() {
    this.location.back();
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
      this.$isHiddenLoading.set(true);
    }

    this.removeFromBookmark(bookmarkType)
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
          this.$isHiddenLoading.set(false);
        }),
      )
      .subscribe();
  }

  public addShowToBookmarks(bookmarkType: BookmarksEnum) {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;
    if (bookmarkType === BookmarksEnum.watchlist) {
      this.$isWatchlistLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.watched) {
      this.$isWatchedLoading.set(true);
    }
    if (bookmarkType === BookmarksEnum.hidden) {
      this.$isHiddenLoading.set(true);
    }
    const listName =
      bookmarkType === BookmarksEnum.hidden
        ? 'black list'
        : bookmarkType === BookmarksEnum.watched
          ? 'watched list'
          : 'watch list';

    this.addToBookmark(bookmarkType)
      .pipe(
        tap(() => {
          bookmarkType === BookmarksEnum.watchlist
            ? this.$isInWatchlist.set(true)
            : bookmarkType === BookmarksEnum.watched
              ? this.$isWatched.set(true)
              : this.$isHidden.set(true);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Show was added in the ${listName}!`,
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
          this.$isHiddenLoading.set(false);
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
      this.loaderService.setIsLoading(true);
      this.$page.update((val) => ++val);

      this.getShows();
    } else {
      this.showsStore.setSelectedShow(this.$showsResults()![this.$showIdx()]);
    }

    this.checkShowBookmark(BookmarksEnum.hidden);
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
    if (bookmarkType === BookmarksEnum.hidden) {
      this.$isHiddenLoading.set(true);
    }

    this.getFromBookmarks(bookmarkType)
      .pipe(
        tap((response) => {
          if (response.data()) {
            bookmarkType === BookmarksEnum.watchlist
              ? this.$isInWatchlist.set(true)
              : bookmarkType === BookmarksEnum.watched
                ? this.$isWatched.set(true)
                : this.$isHidden.set(true);
          } else {
            bookmarkType === BookmarksEnum.watchlist
              ? this.$isInWatchlist.set(false)
              : bookmarkType === BookmarksEnum.watched
                ? this.$isWatched.set(false)
                : this.$isHidden.set(false);
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
          this.$isHiddenLoading.set(false);
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
    return this.showsService.addToHidden(
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
    return this.showsService.removeFromHidden(
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
    return this.showsService.getFromHidden(
      String(this.$selectedShow()!.id),
      this.$currentUser()!.uid,
    );
  }

  private getShows() {
    this.showsService
      .getShows(this.$page())
      .pipe(
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
