import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RippleModule, RouterLink, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userDataService = inject(UserDataService);
  private readonly messageService = inject(MessageService);
  private readonly loaderService = inject(LoaderService);

  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $isMoviePage = signal(false);
  public readonly $isNavHidden = signal(false);
  public readonly $isLoading = signal(false);
  public readonly deviceWith = window.innerWidth;

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isMoviePage.set(res.urlAfterRedirects.includes('/movie'));
        this.$isNavHidden.set(res.urlAfterRedirects.includes('/login'));
      }
    });
  }

  public closeNav(checkbox: HTMLElement) {
    checkbox.click();
  }

  public signOut() {
    this.loaderService.setIsLoading(true);
    this.authService
      .singOut()
      .pipe(
        tap(() => {
          this.router.navigateByUrl('/app');
        }),
        finalize(() => {
          this.loaderService.setIsLoading(false);
        }),
        catchError((err) => {
          this.loaderService.setIsLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong. Please try again!',
          });

          return of(err);
        }),
      )
      .subscribe();
  }
}
