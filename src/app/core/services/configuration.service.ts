import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { UserLocationResponseInterface, genres, streamingPlatforms } from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);

  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();

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
    return genres;
  }
}
