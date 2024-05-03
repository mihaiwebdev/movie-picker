import { Component, inject } from '@angular/core';
import {
  GenresComponent,
  ShowComponent,
  ShowTypeComponent,
  StreamingPlatformComponent,
  TrendingComponent,
} from '.';
import { HttpClient } from '@angular/common/http';

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
  private readonly http = inject(HttpClient);
  tmdbApi = 'https://api.themoviedb.org/3';

  constructor() {
    this.http
      .get(
        `${this.tmdbApi}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`,
        {
          headers: {
            accept: 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMmRjMDI0Mjc2MWU3NmVmZGJmZTI1OGRjYjdiZjlkMCIsInN1YiI6IjYzNGU3YTY1Mzg5ZGExMDA3OWU2NGE1YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GQ3OTma_bWgWATd-IWV7i_F-BXgBRRTEz8XhzVO9XcY',
          },
        }
      )
      .subscribe((res) => console.log(res));
  }
}

export default ShowsComponent;
