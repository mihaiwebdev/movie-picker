import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserLocationResponseInterface, streamingPlatforms } from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);

  public getStreamingPlatforms() {
    return streamingPlatforms;
  }

  public getUserLocation() {
    return this.http.get<UserLocationResponseInterface>(
      `${environment.ipInfoUrl}?token=${environment.ipInfoToken}`
    );
  }
}
