import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { FooterComponent, HeaderComponent } from './core';
import { ShowsComponent } from './shows';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ShowsComponent,
    HeaderComponent,
    FooterComponent,
    StyleClassModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly router = inject(Router);
  public readonly $isNavHidden = signal(false);

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd && res.url === '/movie') {
        this.$isNavHidden.set(true);
      } else {
        this.$isNavHidden.set(false);
      }
    });
  }
}
