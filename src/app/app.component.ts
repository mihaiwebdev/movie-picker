import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { ToastModule } from 'primeng/toast';
import { environment } from '../environments/environment.development';
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
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly firebaseApp;
  // private readonly analytics;
  private readonly db;
  private readonly firebaseConfig;

  public readonly $isAppVisible = signal(true);

  constructor() {
    this.firebaseConfig = environment.firebaseConfig;
    this.firebaseApp = initializeApp(this.firebaseConfig);
    // this.analytics = getAnalytics(this.firebaseApp)
    this.db = getFirestore(this.firebaseApp);
  }

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.router.events.subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.$isAppVisible.set(res.url.includes('/app'));
      }
    });
  }
}
