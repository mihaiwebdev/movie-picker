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
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
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
  private page = 1;
  private isFirstPlatformChange = true;
  private isFirstSliderEnd = true;
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
        if (this.isFirstSliderEnd) {
          this.isFirstSliderEnd = false;
          return;
        }

        this.getTrendingShows(true).subscribe();
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
  public readonly $isImgLoading = signal(true);

  @ViewChild('mySwiper') mySwiper?: ElementRef;
  @ViewChild('mySwiperMobile') mySwiperMobile?: ElementRef;

  ngOnInit() {
    // On show type changes
    this.showTypeObs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        switchMap(() => {
          return this.getTrendingShows(false);
        }),
      )
      .subscribe();

    // On streaming platforms changes
    this.streamingPlatformObs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.$selectedPlatformNames.set(
            res.map((platform) => platform.provider_name),
          );
        }),
        switchMap(() => {
          if (this.isFirstPlatformChange) {
            this.isFirstPlatformChange = false;
            return of(null);
          } else {
            return this.getTrendingShows(false);
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

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  private getTrendingShows(
    isUpdate: boolean = false,
  ): Observable<ShowResponseInterface> {
    this.loaderService.setIsLoading(true);
    this.$isImgLoading.set(true);
    const showType = this.showsStore.$selectedShowType();

    if (isUpdate) {
      this.page++;
    } else {
      this.mySwiper?.nativeElement.swiper.slideTo(10, 0);
      this.mySwiperMobile?.nativeElement.swiper.slideTo(10, 0);
      this.page = 1;
    }

    return this.showsService.getTrendingShows(showType, this.page).pipe(
      takeUntilDestroyed(this.destroyRef),
      map((res) => {
        if (!isUpdate) {
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
