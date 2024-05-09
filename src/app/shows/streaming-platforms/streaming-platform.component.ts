import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import { ConfigurationService } from '../../core';

@Component({
  selector: 'app-streaming-platform',
  standalone: true,
  imports: [],
  templateUrl: './streaming-platform.component.html',
  styleUrl: './streaming-platform.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StreamingPlatformComponent implements AfterViewInit {
  private readonly configurationService = inject(ConfigurationService);
  public readonly streamingPlatforms =
    this.configurationService.getStreamingPlatforms();
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/original';

  // SWIPER Config
  public readonly breakpoints = {
    breakpoints: {
      320: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      480: {
        slidesPerView: 5,
        spaceBetween: 40,
      },
      640: {
        slidesPerView: 6,
        spaceBetween: 40,
      },

      780: {
        slidesPerView: 7,
        spaceBetween: 50,
      },

      1200: {
        slidesPerView: 8,
        spaceBetween: 70,
      },
    },
  };

  public readonly params = {
    injectStyles: [
      `
      :host(.overflow-visible) .swiper {
        overflow:visible !important;
      }
      `,
    ],
  };

  public readonly pagination = {
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
    },
  };

  constructor() {
    register();
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;

  ngAfterViewInit() {
    Object.assign(this.mySwiper?.nativeElement, this.params);
    Object.assign(this.mySwiper?.nativeElement, this.breakpoints);
    Object.assign(this.mySwiper?.nativeElement, this.pagination);

    this.mySwiper?.nativeElement.initialize();
  }
}
