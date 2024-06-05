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
  selector: 'app-watched-shows',
  standalone: true,
  imports: [
    DataViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    FormsModule,
    InputTextModule,
    FloatLabelModule,
  ],
  templateUrl: './watched-shows.component.html',
  styleUrl: './watched-shows.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchedShowsComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly userDataService = inject(UserDataService);
  private readonly $currentUser = this.userDataService.$currentUser;
  private readonly $width = signal(window.innerWidth);
  private currentPage = 0;

  public readonly $searchValue = model<string>('');
  public readonly $watchedShows = signal<ShowInterface[]>([]);
  public readonly $filteredWatchedShows = computed(() =>
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
    this.getAllWatchedShows();
  }

  public filterWatchlist(value: string) {
    if (value.length > 0) {
      return this.$watchedShows().filter((show) =>
        (show.title || show.name || '')
          .trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase()),
      );
    } else {
      return this.$watchedShows();
    }
  }

  public removeFromWatchedShows($event: Event, showId: number) {
    $event.stopPropagation();
    if (!this.$currentUser()?.uid) return;

    this.$isRemoveLoading.set(true);

    this.showsService
      .removeFromWatchedShows(String(showId), this.$currentUser()!.uid)
      .pipe(
        tap(() => {
          this.$watchedShows.update((shows) =>
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

  private getAllWatchedShows() {
    if (!this.$currentUser()?.uid) return;

    this.$isGetShowsLoading.set(true);
    this.showsService
      .getAllWatchedShows(this.$currentUser()!.uid)
      .pipe(
        tap((res) => {
          let shows: ShowInterface[] = [];
          res.forEach((show) => shows.push(show.data() as ShowInterface));
          this.$watchedShows.set(shows);
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
