import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  HostListener,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ShowInterface } from '../../core';

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
  public readonly $trendingShows = input<ShowInterface[]>([]);
  public readonly $selectedShowType = input('');
  public readonly $areTrendingShowsLoading = input(true);
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';
  public readonly $screenWidth = signal(NaN);
  private swiperParams = {
    slideToClickedSlide: true,
  };

  constructor() {
    effect(() => {
      if (this.$trendingShows().length > 0) {
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

  public onShowClick() {}
}
