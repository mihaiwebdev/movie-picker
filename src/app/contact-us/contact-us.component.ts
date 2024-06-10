import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MailService } from '../core/services/mail.service';
import { LoaderService } from '../core';
import { MessageService } from 'primeng/api';
import { catchError, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    InputTextareaModule,
    FloatLabelModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly mailService = inject(MailService);
  private readonly loaderService = inject(LoaderService);
  private readonly messageService = inject(MessageService);

  public get emailControl() {
    return this.contactForm.controls['email'];
  }
  public get summaryControl() {
    return this.contactForm.controls['summary'];
  }
  public get subjectControl() {
    return this.contactForm.controls['subject'];
  }
  public readonly contactForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    summary: ['', Validators.required],
    subject: ['', Validators.required],
  });

  public onSubmit() {
    if (this.contactForm.invalid) {
      this.emailControl.markAsDirty();
      this.summaryControl.markAsDirty();
      this.subjectControl.markAsDirty();

      return;
    }

    this.loaderService.setIsLoading(true);

    this.mailService
      .contactUs(
        this.subjectControl.value,
        this.summaryControl.value,
        this.emailControl.value,
      )
      .pipe(
        tap(() =>
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Message sent!`,
          }),
        ),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Something went wrong!`,
          });

          return of(err);
        }),
        finalize(() => {
          this.loaderService.setIsLoading(false);
          this.contactForm.reset();
        }),
      )
      .subscribe();
  }
}

export default ContactUsComponent;
