import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';
import { MessageService } from 'primeng/api';
import { LoaderService } from '../../services/loader.service';

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

  public async signOut() {
    this.loaderService.setIsLoading(true);
    try {
      await this.authService.singOut();
      this.loaderService.setIsLoading(false);
      this.router.navigateByUrl('/app');
    } catch (error) {
      this.loaderService.setIsLoading(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong. Please try again!',
      });
    }
  }
}
