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
        this.router.navigateByUrl('/app');
      }
    });
  }

  ngOnInit() {
    if (this.router.url.includes('apiKey')) {
      this.checkIsSignInWithEmailLink();
    }

    this.checkRedirectResult();
  }

  public async loginWithEmail() {
    if (this.emailFormControl.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email',
      });
      return;
    }

    this.$isLoading.set(true);

    try {
      await this.authService.loginWithEmail(this.emailFormControl.value);

      this.storageService.setToLocalStorage(
        environment.email,
        this.emailFormControl.value,
      );
      this.$isLoading.set(false);
      this.$successEmailSent.set('Please check your email!');
      this.emailFormControl.reset('');
    } catch (error) {
      this.$isLoading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
    }
  }

  public async loginWithGoogle() {
    this.$isLoading.set(true);

    try {
      await this.authService.loginWithGoogle();

      this.$isLoading.set(false);
    } catch (error) {
      this.$isLoading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
    }
  }

  public async loginWithTwitter() {
    this.$isLoading.set(true);

    try {
      await this.authService.loginWithTwitter();

      this.$isLoading.set(false);
    } catch (error) {
      this.$isLoading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
    }
  }

  private async checkRedirectResult() {
    this.$isLoading.set(true);
    try {
      await this.authService.getRedirectResult();

      this.$isLoading.set(false);
    } catch (error) {
      this.$isLoading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
    }
  }

  private async checkIsSignInWithEmailLink() {
    this.$isLoading.set(true);
    try {
      await this.authService.checkIsSingInWithEmailLink();

      this.storageService.removeFromLocalStorage(environment.email);
      this.$isLoading.set(false);
    } catch (error) {
      this.$isLoading.set(false);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
      this.router.navigateByUrl('/app/login');
    }
  }
}

export default AuthComponent;
