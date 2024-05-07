import { Component, inject, signal } from '@angular/core';
import {
  GenresComponent,
  ShowComponent,
  ShowTypeComponent,
  StreamingPlatformComponent,
  TrendingComponent,
} from '.';
import {
  ConfigurationService,
  GenreInterface,
  ShowTypesEnum,
  ShowsService,
} from '../core';

@Component({
  selector: 'app-movie',
  standalone: true,
  imports: [
    ShowTypeComponent,
    StreamingPlatformComponent,
    ShowComponent,
    GenresComponent,
    TrendingComponent,
  ],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.css',
})
export class ShowsComponent {
  private readonly showsService = inject(ShowsService);
  private readonly configurationService = inject(ConfigurationService);

  private selectedShowType = ShowTypesEnum.movie;
  private selectedGenres: GenreInterface[] = [];
  public readonly $streamingPlatforms = signal(
    this.configurationService.getStreamingPlatforms()
  );
  public readonly $userLocation = this.configurationService.$userLocation;
  public readonly $genres = this.configurationService.$genres;

  constructor() {
    this.getUserLocation();
    this.getGenres();
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

  private getUserLocation() {
    if (this.$userLocation()) return;
    this.configurationService.getUserLocation();
  }

  private getGenres() {
    if (this.$genres().length > 0) return;
    this.configurationService.getGenres();
  }
}

export default ShowsComponent;
