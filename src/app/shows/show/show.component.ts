import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ShowsService, movieGenres, tvGenres } from '../../core';
import { ShowsStore } from '../../core/store/shows.store';
import { GenreInterface, ReadMoreDirective } from '../../shared';
import { MessageService } from 'primeng/api';
import { catchError, finalize, of, tap } from 'rxjs';

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

  private readonly allGenres = [...movieGenres, ...tvGenres];
  private readonly nextShowClosureFn = this.showsStore.nextShow();

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/original';
  public readonly $selectedShow = this.showsStore.$selectedShow;
  public readonly $showsResults = this.showsStore.$showsResults;
  public readonly $showGenres = computed(
    () => this.$selectedShow()?.genre_ids && this.getShowGenres(),
  );
  public readonly $isWatched = signal(false);
  public readonly $showIdx = signal(0);
  public readonly $isImgLoading = signal(true);
  public readonly $isWatchlistLoading = signal(false);

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

  public async addToWatchlist() {
    if (!this.$selectedShow()?.id) return;

    this.$isWatchlistLoading.set(true);

    this.showsService
      .addToWatchlist(this.$selectedShow()!.id)
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

  public async removeFromWatchlsit() {
    if (!this.$selectedShow()?.id) return;

    this.$isWatchlistLoading.set(true);

    this.showsService
      .removeFromWatchlist(this.$selectedShow()!.id.toString())
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

  public async checkIsShowWatched() {
    if (!this.$selectedShow()?.id) return;
    this.$isWatchlistLoading.set(true);

    this.showsService
      .getFromWatchlist(this.$selectedShow()!.id.toString())
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
    this.$isImgLoading.set(true);

    let idx = this.nextShowClosureFn(prev, next);

    this.$showIdx.set(idx || 0);

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
