import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RippleModule } from 'primeng/ripple';
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
import { finalize, tap } from 'rxjs';

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

  private selectedShowType = ShowTypesEnum.movie;
  private selectedPlatforms: number[] = [];
  private readonly $userLocation = this.configurationService.$userLocation;

  public readonly $trendingShows = signal<ShowInterface[]>([]);
  public readonly streamingPlatforms =
    this.configurationService.getStreamingPlatforms();
  public readonly genres = this.configurationService.getGenres();
  public readonly $selectedGenres = signal<number[]>([]);
  public readonly $selectedShowType = signal('');
  public readonly $page = signal(1);
  public readonly $isLoading = signal(true);

  constructor() {
    this.getUserLocation();
    this.getTrendingShows();
  }

  public getShows(
    showType: string,
    page: number,
    location: string,
    genres: number[],
    watchProviders: number[]
  ) {
    this.showsService
      .getShows(showType, page, location, genres, watchProviders)
      .subscribe((res) => console.log(res));
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

  public getShow() {
    this.showsService
      .getShows(
        this.selectedShowType,
        this.$page(),
        this.$userLocation()?.country || 'US',
        this.$selectedGenres(),
        this.selectedPlatforms
      )
      .subscribe((res) => console.log(res));
  }

  private getUserLocation() {
    if (this.$userLocation()) return;
    this.configurationService.getUserLocation();
  }

  private getTrendingShows() {
    this.$isLoading.set(true);

    this.showsService
      .getTrendingShows(this.selectedShowType)
      .pipe(
        tap((res) => this.$trendingShows.set(res.results)),
        finalize(() => this.$isLoading.set(false))
      )
      .subscribe();
  }
}

export default ShowsComponent;
