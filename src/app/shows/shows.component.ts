import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  ShowTypesEnum,
  ShowsService,
  StreamingPlatformsInterface,
} from '../core';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [
    ShowTypeComponent,
    ShowGenresComponent,
    ShowComponent,
    PlatformListComponent,
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
  private selectedGenres: GenreInterface[] = [];
  private selectedPlatforms: StreamingPlatformsInterface[] = [];
  private readonly $userLocation = this.configurationService.$userLocation;

  public readonly streamingPlatforms =
    this.configurationService.getStreamingPlatforms();
  public readonly genres = this.configurationService.getGenres();

  constructor() {
    this.getUserLocation();
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
  }

  public onGenresSelect(genres: GenreInterface[]) {
    this.selectedGenres = genres;
  }

  public onPlatformSelect(platforms: StreamingPlatformsInterface[]) {
    this.selectedPlatforms = platforms;
  }

  private getUserLocation() {
    if (this.$userLocation()) return;
    this.configurationService.getUserLocation();
  }
}

export default ShowsComponent;
