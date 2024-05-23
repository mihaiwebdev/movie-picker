import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { User, onAuthStateChanged } from 'firebase/auth';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UserLocationResponseInterface } from '../types/user-location-response.interface';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigurationService);
  private readonly auth = this.configService.auth;

  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
    $currentUser: signal<User | null>(null),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();

  public readonly $currentUser = this.state.$currentUser.asReadonly();

  constructor() {
    // this.getUserLocation()
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.state.$currentUser.set(user);
      } else {
        this.state.$currentUser.set(null);
      }
    });
  }

  public getUserLocation() {
    this.http
      .get<UserLocationResponseInterface>(
        `${environment.ipInfoUrl}?token=${environment.ipInfoToken}`,
      )
      .pipe(tap((userLocation) => this.state.$userLocation.set(userLocation)))
      .subscribe();
  }
}
