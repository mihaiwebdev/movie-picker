import { Injectable, inject } from '@angular/core';
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { from, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ConfigurationService } from './configuration.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageService = inject(StorageService);
  private readonly configService = inject(ConfigurationService);

  private readonly googleProvider = new GoogleAuthProvider();
  private readonly twitterProvider = new TwitterAuthProvider();

  public readonly auth = getAuth(this.configService.firebaseApp);

  private readonly actionCodeSettings = {
    url: `${environment.baseAppUrl}/login`,
    handleCodeInApp: true,
  };

  public loginWithEmail(email: string) {
    return from(
      sendSignInLinkToEmail(this.auth, email, this.actionCodeSettings),
    );
  }

  public checkIsSingInWithEmailLink() {
    if (isSignInWithEmailLink(this.auth, window.location.href)) {
      let email = this.storageService.getFromLocalStorage(environment.email);

      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      return from(signInWithEmailLink(this.auth, email, window.location.href));
    }

    return;
  }

  public loginWithGoogle() {
    return from(signInWithRedirect(this.auth, this.googleProvider));
  }

  public loginWithTwitter() {
    return from(signInWithPopup(this.auth, this.twitterProvider)).pipe(
      tap((result) => {
        console.log(result);
      }),
    );
  }

  public getRedirectResult() {
    return from(getRedirectResult(this.auth));
  }

  public singOut() {
    return from(signOut(this.auth));
  }
}
