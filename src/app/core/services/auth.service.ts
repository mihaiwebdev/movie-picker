import { Injectable, inject, signal } from '@angular/core';
import {
  User,
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageService = inject(StorageService);
  private readonly auth = getAuth();
  private readonly actionCodeSettings = {
    url: `${environment.baseAppUrl}/login`,
    handleCodeInApp: true,
  };

  private readonly state = {
    $currentUser: signal<User | null>(null),
  };
  public readonly $currentUser = this.state.$currentUser.asReadonly();

  public setCurrentUser(user: User | null) {
    this.state.$currentUser.set(user);
  }

  public async emailLinkAuth(email: string) {
    return await sendSignInLinkToEmail(
      this.auth,
      email,
      this.actionCodeSettings,
    );
  }

  public async checkIsSingInWithEmailLink() {
    if (isSignInWithEmailLink(this.auth, window.location.href)) {
      let email = this.storageService.getFromLocalStorage(environment.email);

      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      return await signInWithEmailLink(this.auth, email, window.location.href);
    }

    return;
  }
}
