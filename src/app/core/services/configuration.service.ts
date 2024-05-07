import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  GenreInterface,
  GenresResponseInterface,
  UserLocationResponseInterface,
  streamingPlatforms,
} from '../';
import { environment } from '../../../environments/environment.development';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);

  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
    $genres: signal<GenreInterface[]>([]),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();
  public readonly $genres = this.state.$genres.asReadonly();

  public getStreamingPlatforms() {
    return streamingPlatforms;
  }

  public getUserLocation() {
    this.http
      .get<UserLocationResponseInterface>(
        `${environment.ipInfoUrl}?token=${environment.ipInfoToken}`
      )
      .pipe(tap((userLocation) => this.state.$userLocation.set(userLocation)))
      .subscribe();
  }

  public getGenres() {
    this.http
      .get<GenresResponseInterface>(
        `${environment.tmdbApiUrl}/genre/movie/list`
      )
      .pipe(tap((genres) => this.state.$genres.set(genres.genres)))
      .subscribe();
  }
}
