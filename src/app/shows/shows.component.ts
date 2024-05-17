import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { finalize, map, tap } from 'rxjs';
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
        finalize(() => {
          this.$isGetShowLoading.set(false);
          this.router.navigate(['/movie']);
        }),
      )
      .subscribe();
  }

  public onSelectShowTypeOutput(showType: ShowTypesEnum) {
    this.$areTrendingShowsLoading.set(true);
    this.showsService
      .getTrendingShows(showType)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((res) => res.results),
        tap((res) => {
          this.$trendingShows.set(res);
        }),
        finalize(() => this.$areTrendingShowsLoading.set(false)),
      )
      .subscribe();
  }
}

export default ShowsComponent;
