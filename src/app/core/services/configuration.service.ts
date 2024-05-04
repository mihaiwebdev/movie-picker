import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CountrieResponseModel, LanguageResponseInterface } from '../';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly countriesPath = 'configuration/countries';
  private readonly languagesPath = 'configuration/languages';
  private readonly streamingPlatforms = [
    {
      providerID: 8,
      logoPath: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
      providerName: 'Netflix',
    },
    {
      providerID: 337,
      logoPath: '/97yvRBw1GzX7fXprcF80er19ot.jpg',
      providerName: 'Disney Plus',
    },
    {
      providerID: 384,
      logoPath: '/b8edpTaLCHFrUnhpGQIZJUpFX7T.jpg',
      providerName: 'HBO Max',
    },
    {
      providerID: 119,
      logoPath: '/dQeAar5H991VYporEjUspolDarG.jpg',
      providerName: 'Amazone Prime Video',
    },
    {
      providerName: 'Hulu',
      logoPath: '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg',
      providerID: 15,
    },
    {
      providerID: 2,
      logoPath: '/9ghgSC0MA082EL6HLCW3GalykFD.jpg',
      providerName: 'Apple TV',
    },
    {
      providerID: 35,
      logoPath: '/bZvc9dXrXNly7cA0V4D9pR8yJwm.jpg',
      providerName: 'Rakuten TV',
    },
    {
      providerID: 7,
      logoPath: '/i6lRmkKmJ23oOZ6IyjnOYLKxA9J.jpg',
      providerName: 'Vudu',
    },
    {
      providerID: 3,
      logoPath: '/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg',
      providerName: 'Google Play Movies',
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
