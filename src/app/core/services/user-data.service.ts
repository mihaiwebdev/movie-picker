import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { User, onAuthStateChanged } from 'firebase/auth';
import { catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UserLocationResponseInterface } from '../../shared/types/user-location-response.interface';
import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly auth = this.authService.auth;
  private readonly loaderService = inject(LoaderService);

  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
    $currentUser: signal<User | null>(null),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();
  public readonly $currentUser = this.state.$currentUser.asReadonly();

  constructor() {
    this.getCurrentUser();
  }

  public getCurrentUser() {
    this.loaderService.setIsLoading(true);

    onAuthStateChanged(this.auth, (user) => {
      this.state.$currentUser.set(user);

      this.loaderService.setIsLoading(false);
    });
  }

  // TODO: give back hardcoded platforms on error
  public getUserLocation() {
    return this.http
      .get<UserLocationResponseInterface>(
        `${environment.ipInfoUrl}/json?token=${environment.ipInfoToken}`,
      )
      .pipe(tap((userLocation) => this.state.$userLocation.set(userLocation)));
  }
}
