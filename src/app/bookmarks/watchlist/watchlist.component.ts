import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, finalize, of, tap } from 'rxjs';
import { ShowsService, ShowsStore } from '../../core';
import { UserDataService } from '../../core/services/user-data.service';
import { ShowInterface } from '../../shared';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    DataViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    FormsModule,
    InputTextModule,
    FloatLabelModule,
  ],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly userDataService = inject(UserDataService);
  private readonly $currentUser = this.userDataService.$currentUser;
  private readonly $width = signal(window.innerWidth);
  private currentPage = 0;

  public readonly $searchValue = model<string>('');
  public readonly $watchlist = signal<ShowInterface[]>([]);
  public readonly $filteredWatchlist = computed(() =>
    this.filterWatchlist(this.$searchValue()),
  );
  public readonly $isGetShowsLoading = signal(false);
  public readonly $isRemoveLoading = signal(false);
  public readonly $isImgLoading = signal(true);
  public readonly $rows = computed(() =>
    this.$width() >= 1200
      ? 12
      : this.$width() >= 1024
        ? 9
        : this.$width() >= 768
          ? 6
          : 5,
  );
  public readonly $rowsArray = computed(() => Array(this.$rows()));
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';

  ngOnInit() {
    this.getWatchlist();
  }

  public filterWatchlist(value: string) {
    if (value.length > 0) {
      return this.$watchlist().filter((show) =>
        (show.title || show.name || '')
          .trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase()),
      );
    } else {
      return this.$watchlist();
    }
  }

  public removeFromWatchlist($event: Event, showId: number) {
    $event.stopPropagation();
    if (!this.$currentUser()?.uid) return;

    this.$isRemoveLoading.set(true);

    this.showsService
      .removeFromWatchlist(String(showId), this.$currentUser()!.uid)
      .pipe(
        tap(() => {
          this.$watchlist.update((shows) =>
            shows.filter((show) => show.id !== showId),
          );
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get remove the show',
          });
          return of(err);
        }),
        finalize(() => this.$isRemoveLoading.set(false)),
      )
      .subscribe();
  }

  public openShow(show: ShowInterface) {
    this.showsStore.setSelectedShow(show);
    this.showsStore.setResultPages(1);
    this.showsStore.setShowsResults([show]);

    this.router.navigateByUrl('/app/movie');
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }
  public setImageLoading(event: any) {
    if (this.currentPage === event.first) return;

    this.currentPage = event.first;
    this.$isImgLoading.set(true);
  }

  private getWatchlist() {
    if (!this.$currentUser()?.uid) return;

    this.$isGetShowsLoading.set(true);
    this.showsService
      .getAllFromWatchlist(this.$currentUser()!.uid)
      .pipe(
        tap((res) => {
          let shows: ShowInterface[] = [];
          res.forEach((show) => shows.push(show.data() as ShowInterface));
          this.$watchlist.set(shows);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get the watched shows',
          });
          return of(err);
        }),
        finalize(() => this.$isGetShowsLoading.set(false)),
      )
      .subscribe();
  }
}
