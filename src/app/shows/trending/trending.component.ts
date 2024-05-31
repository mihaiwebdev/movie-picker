import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ShowsStore } from '../../core';
import { ShowInterface, ShowTypesEnum } from '../../shared';

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
  private readonly router = inject(Router);
  private readonly swiperParams = {
    slideToClickedSlide: true,
  };

  public readonly $trendingShows = input<ShowInterface[] | null>(null);
  public readonly $selectedShowType = computed(() =>
    this.showsStore.$selectedShowType() === ShowTypesEnum.tv
      ? 'TV Series'
      : 'Movies',
  );
  public readonly $areTrendingShowsLoading = input(true);
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';
  public readonly screenWidth = window.innerWidth;

  constructor() {
    effect(() => {
      if (
        this.$trendingShows() &&
        this.$trendingShows()!.length > 0 &&
        this.mySwiper
      ) {
        Object.assign(this.mySwiper?.nativeElement, this.swiperParams);
        this.mySwiper?.nativeElement.initialize();
      }
    });
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;

  public onShowClick(show: ShowInterface) {
    if (this.$trendingShows()) {
      this.showsStore.setShowsResults(this.$trendingShows()!);
    }

    this.showsStore.setSelectedShow(show);
    this.router.navigateByUrl('/app/movie');
  }
}
