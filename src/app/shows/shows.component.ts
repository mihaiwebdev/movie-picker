import { Component, inject, signal } from '@angular/core';
import {
  GenresComponent,
  ShowComponent,
  ShowTypeComponent,
  StreamingPlatformComponent,
  TrendingComponent,
} from '.';
import { ConfigurationService, ShowsService } from '../core';

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

  public readonly $streamingPlatforms = signal(
    this.configurationService.getStreamingPlatforms()
  );
  public userLocation = '';

  constructor() {
    this.getUserLocation();
  }

  public getShows(
    showType: string,
    genres: number[],
    watchProviders: number[]
  ) {
    this.showsService
      .getShows(showType, 1, this.userLocation, genres, watchProviders)
      .subscribe((res) => console.log(res));
  }

  private getUserLocation() {
    this.configurationService
      .getUserLocation()
      .subscribe((res) => (this.userLocation = res.country));
  }
}

export default ShowsComponent;
