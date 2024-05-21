import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './core';
import { ShowsComponent } from './shows';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ShowsComponent,
    HeaderComponent,
    StyleClassModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);

  public readonly $isAppVisible = signal(true);

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isAppVisible.set(
          res.url.includes('/app') || res.urlAfterRedirects.includes('/app'),
        );
      }
    });

    // onAuthStateChanged(this.auth, (user) => {
    //   console.log('hi');

    //   if (user) {
    //     this.authService.setCurrentUser(user);
    //   } else {
    //     this.authService.setCurrentUser(null);
    //   }
    // });
  }
}
