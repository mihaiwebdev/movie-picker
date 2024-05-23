import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { MessageService } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { ToastModule } from 'primeng/toast';
import { ConfigurationService, HeaderComponent, UserDataService } from './core';
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
  private readonly configService = inject(ConfigurationService);
  private readonly userDataService = inject(UserDataService);
  private readonly auth = this.configService.auth;

  public readonly $isAppVisible = signal(true);

  ngOnInit() {
    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isAppVisible.set(res.urlAfterRedirects.includes('/app'));
      }
    });

    // onAuthStateChanged(this.auth, (user) => {
    //   if (user) {
    //     this.userDataService.setCurrentUser(user);
    //   } else {
    //     this.userDataService.setCurrentUser(null);
    //   }

    //   console.log(this.userDataService.$currentUser());
    // });
  }
}
