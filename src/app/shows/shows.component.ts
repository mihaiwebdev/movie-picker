import { Component, inject } from '@angular/core';
import {
  GenresComponent,
  ShowComponent,
  ShowTypeComponent,
  StreamingPlatformComponent,
  TrendingComponent,
} from '.';
import { ShowsService } from '../core';

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

  constructor() {
    this.showsService
      .getShows('movie', 'en-US', 1, 'RO', [16, 35], [8, 337])
      .subscribe((res) => console.log(res));
  }
}

export default ShowsComponent;
