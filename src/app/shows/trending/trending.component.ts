import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ShowInterface, ShowResponseInterface, ShowsService } from '../../core';
import { Router } from '@angular/router';

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
  private readonly showsService = inject(ShowsService);
  private readonly router = inject(Router);

  public readonly $trendingShows = input<ShowResponseInterface | null>(null);
  public readonly $selectedShowType = input('');
  public readonly $areTrendingShowsLoading = input(true);

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';

  public readonly $screenWidth = signal(NaN);
  private swiperParams = {
    slideToClickedSlide: true,
  };

  constructor() {
    effect(() => {
      if (this.$trendingShows() && this.$trendingShows()!.results.length > 0) {
        Object.assign(this.mySwiper?.nativeElement, this.swiperParams);
        this.mySwiper?.nativeElement.initialize();
      }
    });
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;

  ngOnInit() {
    this.$screenWidth.set(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.mySwiper?.nativeElement.initialize();

    this.$screenWidth.set(window.innerWidth);
  }

  public onShowClick(show: ShowInterface) {
    if (this.$trendingShows()) {
      this.showsService.setShowsResults(this.$trendingShows()!);
    }

    this.showsService.setSelectedShow(show);
    this.router.navigate(['/', 'movie']);
  }
}
