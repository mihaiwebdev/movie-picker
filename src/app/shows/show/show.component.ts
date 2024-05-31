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
  public readonly $isWatched = signal(false);
  public readonly $isImgLoading = signal(true);
  public readonly $isWatchlistLoading = signal(false);
  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $page = signal(1);
  public readonly $showIdx = signal(0);
  public readonly $isPrevBtn = computed(() => this.$showIdx() > 0);
  public readonly $isNextBtn = computed(() =>
    this.$showsResults()
      ? this.$showIdx() !== this.$showsResults()!.length - 1 ||
        this.$page() !== this.$resultsPages()
      : false,
  );

  ngOnInit(): void {
    if (!this.$selectedShow()) {
      this.router.navigate(['/', 'app']);
      return;
    }

    this.checkIsShowWatched();
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  goBack() {
    this.location.back();
  }

  public addToWatchedShows() {
    if (!this.$selectedShow()?.id || !this.$selectedShow()) return;

    if (!this.$currentUser()?.uid) {
      this.router.navigate(['/app/login']);
      return;
    }

    this.$isWatchlistLoading.set(true);

    this.showsService
      .addToWatchedShows(
        String(this.$selectedShow()!.id),
        this.$selectedShow()!,
        this.$currentUser()!.uid,
      )
      .pipe(
        tap(() => {
          this.$isWatched.set(true);
        }),

        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not add to watchlist',
          });
          return of(error);
        }),
        finalize(() => {
          this.$isWatchlistLoading.set(false);
        }),
      )
      .subscribe();
  }

  public removeFromWatchedShows() {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;

    this.$isWatchlistLoading.set(true);

    this.showsService
      .removeFromWatchedShows(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      )
      .pipe(
        tap(() => this.$isWatched.set(false)),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not remove from watchlist',
          });
          return of(error);
        }),
        finalize(() => this.$isWatchlistLoading.set(false)),
      )
      .subscribe();
  }

  public checkIsShowWatched() {
    if (!this.$selectedShow()?.id || !this.$currentUser()?.uid) return;
    this.$isWatchlistLoading.set(true);

    this.showsService
      .getFromWatchedShows(
        String(this.$selectedShow()!.id),
        this.$currentUser()!.uid,
      )
      .pipe(
        tap((response) => {
          if (response.data()) {
            this.$isWatched.set(true);
          } else {
            this.$isWatched.set(false);
          }
        }),
        catchError((error) => {
          this.$isWatched.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not check if show is watched!',
          });
          return of(error);
        }),
        finalize(() => this.$isWatchlistLoading.set(false)),
      )
      .subscribe();
  }

  public nextShow(prev: boolean, next: boolean) {
    if (!this.$showsResults()) {
      return;
    }
    this.$isImgLoading.set(true);

    if (prev) this.$showIdx.update((val) => --val);
    if (next) this.$showIdx.update((val) => ++val);

    if (
      this.$showIdx() === this.$showsResults()!.length &&
      this.$page() < this.$resultsPages()
    ) {
      this.loaderService.setIsLoading(true);
      this.$page.update((val) => ++val);

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
    } else {
      this.showsStore.setSelectedShow(this.$showsResults()![this.$showIdx()]);
    }

    this.checkIsShowWatched();
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
