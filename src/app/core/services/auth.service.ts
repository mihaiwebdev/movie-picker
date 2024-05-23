import { Injectable, inject } from '@angular/core';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithRedirect,
  signOut,
  getRedirectResult,
} from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { ConfigurationService } from './configuration.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageService = inject(StorageService);
  private readonly configService = inject(ConfigurationService);
  private readonly auth = this.configService.auth;
  private readonly googleProvider = this.configService.googleProvider;

  private readonly actionCodeSettings = {
    url: `${environment.baseAppUrl}/login`,
    handleCodeInApp: true,
  };

  public async loginWithEmail(email: string) {
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

  public async loginWithGoogle() {
    return signInWithRedirect(this.auth, this.googleProvider);
  }

  public async getRedirectResult() {
    return getRedirectResult(this.auth);
  }

  public async singOut() {
    return await signOut(this.auth);
  }
}
