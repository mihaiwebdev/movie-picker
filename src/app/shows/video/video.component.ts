import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { LoaderService, ShowsService, ShowsStore } from '../../core';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [RippleModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css',
})
export class VideoComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly showType = this.showsStore.$selectedShowType();
  private readonly loaderService = inject(LoaderService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly $closeVideo = output<boolean>();
  public readonly $showId = input.required<number | undefined>();
  public readonly showIdObs$ = toObservable(this.$showId);
  public readonly $videoSource = signal<SafeResourceUrl | undefined>(undefined);

  ngOnInit() {
    this.showIdObs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.loaderService.setIsLoading(true);
          this.$videoSource.set('');
        }),
        filter((showId) => !!showId),
        switchMap((showId) =>
          this.showsService.getShowVideo(this.showType, showId!),
        ),
        tap((response) => {
          const videoUrl = `https://www.youtube.com/embed/${response[0].key}?autoplay=1&controls=0`;

          this.$videoSource.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl),
          );

          this.loaderService.setIsLoading(false);
        }),
        catchError((err) => {
          this.loaderService.setIsLoading(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Could not get show trailer`,
          });
          this.$closeVideo.emit(true);
          return of(err);
        }),
      )
      .subscribe();
  }

  public closeVideoModal() {
    this.$closeVideo.emit(true);
  }
}
