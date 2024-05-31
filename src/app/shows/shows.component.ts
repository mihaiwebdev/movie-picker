import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, map, of, tap } from 'rxjs';
import {
  PlatformListComponent,
  ShowComponent,
  ShowGenresComponent,
  ShowTypeComponent,
  TrendingComponent,
} from '.';
import { ShowsService, ShowsStore } from '../core';
import { ShowInterface, ShowTypesEnum } from '../shared';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [
    ShowTypeComponent,
    ShowGenresComponent,
    ShowComponent,
    PlatformListComponent,
    TrendingComponent,
    RippleModule,
    TrendingComponent,
  ],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowsComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  public readonly $isGetShowLoading = signal(false);
  public readonly $areTrendingShowsLoading = signal(false);
  public readonly $trendingShows = signal<ShowInterface[] | null>(null);
  public readonly $selectedGenres = this.showsStore.$selectedGenres;

  public getShows() {
    this.$isGetShowLoading.set(true);
    this.showsService
      .getShows(1)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.router.navigateByUrl('/app/movie');
          this.showsStore.setShowsResults(res);
          this.showsStore.setSelectedShow(res[0]);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get shows',
          });
          return of(err);
        }),
        finalize(() => {
          this.$isGetShowLoading.set(false);
        }),
      )
      .subscribe();
  }

  public onSelectShowTypeOutput(showType: ShowTypesEnum) {
    // Get trending shows
    this.$areTrendingShowsLoading.set(true);
    this.showsService
      .getTrendingShows(showType)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((res) => res.results),
        tap((res) => {
          this.$trendingShows.set(res);
        }),
        catchError((err) => {
          console.log(err);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get the trending shows',
          });
          return of(err);
        }),
        finalize(() => this.$areTrendingShowsLoading.set(false)),
      )
      .subscribe();
  }
}

export default ShowsComponent;
