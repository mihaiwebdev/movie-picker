import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly userDataService = inject(UserDataService);

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

  ngOnInit() {
    if (this.$currentUser()) this.router.navigateByUrl('/app');

    if (this.router.url.includes('login')) {
      console.log(this.router.url);

      // this.checkIsSignInWithEmailLink();
    }
  }

  public async emailLinkAuth() {
    if (this.emailFormControl.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email',
      });
      return;
    }

    try {
      const response = await this.authService.emailLinkAuth(
        this.emailFormControl.value,
      );
      // Add email to ls
      console.log(response);
      console.log('hi');
      this.$successEmailSent.set(
        'The magic link was successfully sent on your email!',
      );
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Something went wrong! Please try again with another sing in option',
      });
    }
  }

  private async checkIsSignInWithEmailLink() {
    try {
      const response = await this.authService.checkIsSingInWithEmailLink();

      if (response) {
        console.log(response);
        this.router.navigateByUrl('/app');
        // Remove email from ls
      }
    } catch (error) {
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
