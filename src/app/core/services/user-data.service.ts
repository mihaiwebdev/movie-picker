import { Injectable, inject, signal } from '@angular/core';
import { UserLocationResponseInterface } from '../types/user-location-response.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly http = inject(HttpClient);

  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();

  public getUserLocation() {
    this.http
      .get<UserLocationResponseInterface>(
        `${environment.ipInfoUrl}?token=${environment.ipInfoToken}`,
      )
      .pipe(tap((userLocation) => this.state.$userLocation.set(userLocation)))
      .subscribe();
  }
}
