import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RippleModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly userDataService = inject(UserDataService);
  private readonly storageService = inject(StorageService);

  public readonly $isLoading = signal(false);

  public get emailFormControl() {
    return this.form.controls['email'];
  }
  public readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  public readonly $successEmailSent = signal('');
  public readonly $currentUser = this.userDataService.$currentUser;

  constructor() {
    effect(() => {
      if (this.$currentUser()) {
        const query = this.router.url.split('?')[1];

        if (query) {
          this.router.navigateByUrl(`/app?${query}`);
        } else {
          this.router.navigateByUrl(`/app`);
        }
      }
    });
  }

  ngOnInit() {
    if (this.router.url.includes('apiKey')) {
      this.checkIsSignInWithEmailLink();
    }

    this.checkRedirectResult();
  }

  public loginWithEmail() {
    if (this.emailFormControl.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email',
      });
      return;
    }

    this.$isLoading.set(true);

    this.authService
      .loginWithEmail(this.emailFormControl.value)
      .pipe(
        tap(() => {
          this.storageService.setToLocalStorage(
            environment.email,
            this.emailFormControl.value,
          );

          this.$successEmailSent.set('Please check your email!');
          this.emailFormControl.reset('');
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Something went wrong! Please try again with another sing in option',
          });
          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }

  public loginWithGoogle() {
    this.$isLoading.set(true);

    this.authService
      .loginWithGoogle()
      .pipe(
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Something went wrong! Please try again with another sing in option',
          });

          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }

  public loginWithTwitter() {
    this.$isLoading.set(true);

    this.authService
      .loginWithTwitter()
      .pipe(
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Something went wrong! Please try again with another sing in option',
          });
          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }

  private checkRedirectResult() {
    this.$isLoading.set(true);

    this.authService
      .getRedirectResult()
      .pipe(
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Something went wrong! Please try again with another sing in option',
          });
          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }

  private checkIsSignInWithEmailLink() {
    this.$isLoading.set(true);

    this.authService
      .checkIsSingInWithEmailLink()
      ?.pipe(
        tap(() => {
          this.storageService.removeFromLocalStorage(environment.email),
            this.router.navigateByUrl('/app');
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Something went wrong! Please try again with another sing in option',
          });
          this.router.navigateByUrl('/app/login');
          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }
}

export default AuthComponent;
