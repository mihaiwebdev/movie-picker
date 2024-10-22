import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core';
import { environment } from '../../../environments/environment.development';
import { catchError, finalize, of, tap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly messageService = inject(MessageService);
  public readonly $isLoading = signal<boolean>(false);
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);

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

          this.$successEmailSent.set(
            'We emailed you the magic link. Please check in spam also!',
          );
          this.emailFormControl.reset('');
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong! Please try again',
          });
          return of(error);
        }),
        finalize(() => this.$isLoading.set(false)),
      )
      .subscribe();
  }
}
