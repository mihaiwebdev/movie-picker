import { Injectable, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { UserLocationResponseInterface } from '../types/user-location-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly state = {
    $userLocation: signal<UserLocationResponseInterface | undefined>(undefined),
    $currentUser: signal<User | null>(null),
  };
  public readonly $userLocation = this.state.$userLocation.asReadonly();

  public readonly $currentUser = this.state.$currentUser.asReadonly();

  public setCurrentUser(user: User | null) {
    this.state.$currentUser.set(user);
  }
}
