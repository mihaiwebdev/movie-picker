import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { LoaderService, ShowsService, ShowsStore } from '../../core';
import {
  ShowInterface,
  ShowResponseInterface,
  ShowTypesEnum,
} from '../../shared';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [],
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingComponent {
  private readonly showsStore = inject(ShowsStore);
  private readonly showsService = inject(ShowsService);
  private readonly loaderService = inject(LoaderService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private page = 0;
  private isFirstTypeChange = true;
  private isFirstPlatformChange = true;
  private isFirstTrendingCall = true;
  private readonly showTypeObs$ = toObservable(
    this.showsStore.$selectedShowType,
  );
  private readonly streamingPlatformObs$ = toObservable(
    this.showsStore.$selectedPlatforms,
  );
  public readonly $selectedPlatformNames = signal<string[]>([]);

  private readonly swiperParams = {
    initialSlide: 10,
    on: {
      reachEnd: () => {
        this.getTrendingShows().subscribe();
      },
    },
  };

  public readonly $trendingShows = signal<ShowInterface[]>([]);
  public readonly $selectedShowType = computed(() =>
    this.showsStore.$selectedShowType() === ShowTypesEnum.tv
      ? `TV Series`
      : 'Movies',
  );

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';
  public readonly screenWidth = window.innerWidth;

  @ViewChild('mySwiper') mySwiper?: ElementRef;
  @ViewChild('mySwiperMobile') mySwiperMobile?: ElementRef;

  ngOnInit() {
    // On show type changes
    this.showTypeObs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          if (this.isFirstTypeChange) {
            this.isFirstTypeChange = false;
          } else {
            this.getTrendingShows(false).subscribe();
          }
        }),
      )
      .subscribe();

    // On streaming platforms changes
    this.streamingPlatformObs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.$selectedPlatformNames.set(res.map((platform) => platform.name));

          if (this.isFirstPlatformChange) {
            this.isFirstPlatformChange = false;
          } else {
            this.getTrendingShows(false).subscribe();
          }
        }),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    if (this.mySwiper) {
      Object.assign(this.mySwiper?.nativeElement, this.swiperParams);
      this.mySwiper?.nativeElement.initialize();
    }

    if (this.mySwiperMobile) {
      Object.assign(this.mySwiperMobile?.nativeElement, this.swiperParams);
      this.mySwiperMobile?.nativeElement.initialize();
    }
  }

  public onShowClick(show: ShowInterface) {
    if (this.$trendingShows()) {
      this.showsStore.setShowsResults(this.$trendingShows()!);
    }

    this.showsStore.setSelectedShow(show);
    const showType = this.showsStore.$selectedShowType();

    this.router.navigateByUrl(`/app/movie?trending=${showType}`);
  }

  private getTrendingShows(
    isUpdate: boolean = true,
  ): Observable<ShowResponseInterface> {
    this.loaderService.setIsLoading(true);
    const showType = this.showsStore.$selectedShowType();
    this.page++;

    return this.showsService.getTrendingShows(showType, this.page).pipe(
      takeUntilDestroyed(this.destroyRef),
      map((res) => {
        if (this.isFirstTrendingCall) {
          this.isFirstTrendingCall = false;
          return {
            ...res,
            results: [
              ...res.results.slice(10, res.results.length).reverse(),
              ...res.results.slice(0, 10),
            ],
          };
        }
        return res;
      }),
      tap((res) => {
        this.showsStore.setResultPages(res.total_results);

        if (isUpdate) {
          this.$trendingShows.update((state) => {
            return state ? [...state, ...res.results] : [...res.results];
          });
        } else {
          this.$trendingShows.set(res.results);
        }
      }),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not get the trending shows',
        });
        return of(err);
      }),
      finalize(() => this.loaderService.setIsLoading(false)),
    );
  }
}
