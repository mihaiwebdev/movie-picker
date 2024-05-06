import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CountrieResponseModel,
  LanguageResponseInterface,
  StreamingPlatformsInterface,
} from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly countriesPath = 'configuration/countries';
  private readonly languagesPath = 'configuration/languages';
  private readonly streamingPlatforms: StreamingPlatformsInterface[] = [
    {
      provider_id: 8,
      logo_path: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
      provider_name: 'Netflix',
    },
    {
      provider_id: 337,
      logo_path: '/97yvRBw1GzX7fXprcF80er19ot.jpg',
      provider_name: 'Disney Plus',
    },
    {
      provider_id: 384,
      logo_path: '/b8edpTaLCHFrUnhpGQIZJUpFX7T.jpg',
      provider_name: 'HBO Max',
    },
    {
      provider_id: 119,
      logo_path: '/dQeAar5H991VYporEjUspolDarG.jpg',
      provider_name: 'Amazone Prime Video',
    },
    {
      provider_name: 'Hulu',
      logo_path: '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg',
      provider_id: 15,
    },
    {
      provider_id: 2,
      logo_path: '/9ghgSC0MA082EL6HLCW3GalykFD.jpg',
      provider_name: 'Apple TV',
    },
    {
      provider_id: 35,
      logo_path: '/bZvc9dXrXNly7cA0V4D9pR8yJwm.jpg',
      provider_name: 'Rakuten TV',
    },
    {
      provider_id: 7,
      logo_path: '/i6lRmkKmJ23oOZ6IyjnOYLKxA9J.jpg',
      provider_name: 'Vudu',
    },
    {
      provider_id: 3,
      logo_path: '/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg',
      provider_name: 'Google Play Movies',
    },
  ];

  public getCountries() {
    return this.http.get<CountrieResponseModel>(
      `${environment.tmdbApiUrl}/${this.countriesPath}`
    );
  }

  public getLanguages() {
    return this.http.get<LanguageResponseInterface>(
      `${environment.tmdbApiUrl}/${this.languagesPath}`
    );
  }

  public getStreamingPlatforms() {
    return this.streamingPlatforms;
  }
}
