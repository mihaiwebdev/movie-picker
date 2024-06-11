import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { Subscription, catchError, finalize, map, of, tap } from 'rxjs';
import { ShowInterface } from '../../../shared';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { ShowsService } from '../../services/shows.service';
import { UserDataService } from '../../services/user-data.service';
import { ShowsStore } from '../../store/shows.store';

export interface ShowSearchSuggestion {
  name: string;
  showData: ShowInterface;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RippleModule,
    RouterLink,
    MenuModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    AutoCompleteModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userDataService = inject(UserDataService);
  private readonly messageService = inject(MessageService);
  private readonly loaderService = inject(LoaderService);
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly destroyRef = inject(DestroyRef);
  private subscription?: Subscription;

  public readonly deviceWith = window.innerWidth;
  public readonly $currentUser = this.userDataService.$currentUser;
  public readonly $isMoviePage = signal(false);
  public readonly $isNavHidden = signal(true);
  public readonly $isLoading = signal(false);
  public readonly $suggestions = signal<ShowSearchSuggestion[]>([]);

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

  public onShowSelect($event: AutoCompleteSelectEvent) {
    const showData: ShowInterface = $event.value.showData;
    this.showsStore.setSelectedShow(showData);
    this.router.navigateByUrl('/app/movie');
  }

  public searchShows($event: AutoCompleteCompleteEvent) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    const value = $event.query.trim().toLowerCase();

    this.subscription = this.showsService
      .searchMulti(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((res) => res.results),
        map((res) =>
          res.filter(
            (value) =>
              value.media_type === 'tv' || value.media_type === 'movie',
          ),
        ),
        map((res) =>
          res.map((show) => ({
            name: `${show.title || show.name} (${show.release_date?.split('-')[0] || show.first_air_date?.split('-')[0]})`,
            showData: show,
          })),
        ),
        tap((res) => {
          this.$suggestions.set(res);
        }),
      )
      .subscribe();
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
