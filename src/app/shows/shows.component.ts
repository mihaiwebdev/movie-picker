import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, filter, finalize, map, of, switchMap, tap } from 'rxjs';
import {
  PlatformListComponent,
  ShowComponent,
  ShowGenresComponent,
  ShowTypeComponent,
  TrendingComponent,
} from '.';
import {
  LoaderService,
  ShowsService,
  ShowsStore,
  UserDataService,
} from '../core';
import { ShowInterface } from '../shared';
import { BookmarksEnum } from '../bookmarks/bookmarks.enum';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [
    ShowTypeComponent,
    ShowGenresComponent,
    ShowComponent,
    PlatformListComponent,
    TrendingComponent,
    RippleModule,
    TrendingComponent,
  ],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowsComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly userDataService = inject(UserDataService);
  private readonly $currentUser = this.userDataService.$currentUser;
  private readonly loaderService = inject(LoaderService);

  public readonly $isGetShowLoading = signal(false);
  public readonly $areTrendingShowsLoading = signal(false);
  public readonly $trendingShows = signal<ShowInterface[] | null>(null);
  public readonly $selectedGenres = this.showsStore.$selectedGenres;

  ngOnInit() {
    this.getShowAndAddToCollection();
  }

  public getShowAndAddToCollection() {
    const movieParam = this.route.snapshot.queryParamMap.get('movie');
    const showType = Boolean(movieParam) ? 'movie' : 'tv';
    const watchedParam = this.route.snapshot.queryParamMap.get('watched');
    const watchlistParam = this.route.snapshot.queryParamMap.get('watchlist');
    const hide = this.route.snapshot.queryParamMap.get('hide');
    const showName = watchedParam || watchlistParam || hide;
    const bookmarkType = watchedParam
      ? BookmarksEnum.watched
      : watchlistParam
        ? BookmarksEnum.watchlist
        : BookmarksEnum.hidden;

    if (!this.$currentUser()?.uid) {
      return;
    }
    if (!showName) {
      return;
    }

    this.loaderService.setIsLoading(true);

    this.showsService
      .getShow(showType, decodeURI(showName))
      .pipe(
        map((res) => res.results),
        filter((res) => !!res[0].id),
        switchMap((res) => {
          const addToCollectionObs = this.showsService.addShow(
            String(res[0].id),
            res[0],
            this.$currentUser()!.uid,
            bookmarkType,
          );

          return res.length > 0 && res[0].id ? addToCollectionObs : of(null);
        }),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${showName} added to ${watchedParam ? 'watched shows' : watchlistParam ? 'watchlist' : 'stop recommending shows'}`,
          });
        }),
        finalize(() => {
          this.loaderService.setIsLoading(false);
          this.router.navigateByUrl('/app');
        }),
      )
      .subscribe();
  }

  public getShows() {
    this.$isGetShowLoading.set(true);
    this.showsService
      .getShows(1)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.showsStore.setShowsResults(res);
          this.showsStore.setSelectedShow(res[0]);
          this.router.navigateByUrl(`/app/movie`);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get shows',
          });
          return of(err);
        }),
        finalize(() => {
          this.$isGetShowLoading.set(false);
        }),
      )
      .subscribe();
  }
}

export default ShowsComponent;
