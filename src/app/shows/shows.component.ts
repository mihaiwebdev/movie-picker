import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  public readonly $streamingPlatforms = toSignal(
    this.configurationService.getStreamingPlatforms()
  );

  public userLocation = '';

  constructor() {
    this.getUserLocation();
  }

  public getShows(showType: string) {
    this.showsService
      .getShows('movie', 'en-US', 1, this.userLocation, [16, 35], [8, 337])
      .subscribe((res) => console.log(res));
  }

  private getUserLocation() {
    this.configurationService
      .getUserLocation()
      .subscribe((res) => (this.userLocation = res.country));
  }
}

export default ShowsComponent;
