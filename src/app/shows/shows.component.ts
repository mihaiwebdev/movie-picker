import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { finalize, tap } from 'rxjs';
import {
  PlatformListComponent,
  ShowComponent,
  ShowGenresComponent,
  ShowTypeComponent,
  TrendingComponent,
} from '.';
import {
  ConfigurationService,
  GenreInterface,
  ShowInterface,
  ShowResponseInterface,
  ShowTypesEnum,
  ShowsService,
  StreamingPlatformsInterface,
} from '../core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

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
  private readonly configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private selectedShowType = ShowTypesEnum.movie;
  private selectedPlatforms: number[] = [];
  private readonly $userLocation = this.configurationService.$userLocation;

  public readonly streamingPlatforms =
    this.configurationService.getStreamingPlatforms();
  public readonly genres = this.configurationService.getGenres();
  public readonly $trendingShows = signal<ShowInterface[]>([]);
  public readonly $selectedGenres = signal<number[]>([]);
  public readonly $selectedShowType = signal('');
  public readonly $page = signal(1);
  public readonly $areTrendingShowsLoading = signal(true);
  public readonly $isGetShowLoading = signal(false);

  constructor() {
    // this.getUserLocation();
    this.getTrendingShows();
  }

  public getShows() {
    console.log('selected show', this.selectedShowType);
    console.log('selected genres', this.$selectedGenres());
    console.log('selected platforms', this.selectedPlatforms);

    this.$isGetShowLoading.set(true);
    this.showsService
      .getShows(
        this.selectedShowType,
        this.$page(),
        this.$userLocation()?.country || 'US',
        this.$selectedGenres(),
        this.selectedPlatforms
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.$isGetShowLoading.set(false);
          this.router.navigate(['/movie']);
        })
      )
      .subscribe();
  }

  public onShowTypeSelect(showType: ShowTypesEnum) {
    this.selectedShowType = showType;
    if (showType.includes('tv')) {
      this.$selectedShowType.set('TV Serie');
    } else {
      this.$selectedShowType.set('Movie');
    }
    this.getTrendingShows();
  }

  public onGenresSelect(genres: GenreInterface[]) {
    this.$selectedGenres.set(genres.map((genre) => genre.id));
  }

  public onPlatformSelect(platforms: StreamingPlatformsInterface[]) {
    this.selectedPlatforms = platforms.map((platform) => platform.provider_id);
  }

  private getUserLocation() {
    if (this.$userLocation()) return;
    this.configurationService.getUserLocation();
  }

  private getTrendingShows() {
    this.$areTrendingShowsLoading.set(true);

    this.showsService
      .getTrendingShows(this.selectedShowType)
      .pipe(
        tap((res) => this.$trendingShows.set(res.results)),
        finalize(() => this.$areTrendingShowsLoading.set(false))
      )
      .subscribe();
  }
}

export default ShowsComponent;
