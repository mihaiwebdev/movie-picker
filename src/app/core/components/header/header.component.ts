import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
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
  private readonly userDataService = inject(UserDataService);

  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $isMoviePage = signal(false);

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isMoviePage.set(res.urlAfterRedirects.includes('/movie'));
      }
    });
  }
}
