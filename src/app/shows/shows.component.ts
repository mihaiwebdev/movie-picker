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
import { ShowInterface, ShowTypesEnum, ShowsService } from '../core';

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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  public readonly $isGetShowLoading = signal(false);
  public readonly $areTrendingShowsLoading = signal(false);
  public readonly $trendingShows = signal<ShowInterface[] | null>(null);
  public readonly $selectedGenres = this.showsService.$selectedGenres;

  public getShows() {
    this.$isGetShowLoading.set(true);
    this.showsService
      .getShows()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.router.navigateByUrl('/app/movie');
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
