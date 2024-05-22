import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
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

  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $isMoviePage = signal(false);
  public readonly deviceWith = window.innerWidth;

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isMoviePage.set(res.urlAfterRedirects.includes('/movie'));
      }
    });
  }

  public async signOut() {
    try {
      const response = await this.authService.singOut();

      console.log(response);
    } catch (error) {}
  }
}
