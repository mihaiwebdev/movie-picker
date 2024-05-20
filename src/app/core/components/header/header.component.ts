import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RippleModule, RouterLink, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  public readonly $isHeadingHidden = signal(false);

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isHeadingHidden.set(res.url.includes('/movie'));
      }
    });
  }
}
