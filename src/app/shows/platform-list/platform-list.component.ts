import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  model,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { tap } from 'rxjs';
import { ShowsService } from '../../core';
import { ShowsStore } from '../../core/store/shows.store';
import { StreamingPlatformsInterface } from '../../shared';

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [MultiSelectModule, FormsModule],
  templateUrl: './platform-list.component.html',
  styleUrl: './platform-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformListComponent {
  private readonly showsStore = inject(ShowsStore);
  private readonly showsService = inject(ShowsService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly $streamingPlatforms = this.showsStore.$allStreamingPlatforms;

  public readonly $selectedStreamingPlatforms = model<
    StreamingPlatformsInterface[]
  >([]);

  ngOnInit() {
    if (this.$streamingPlatforms().length < 1) {
      this.showsService
        .getStreamingPlatforms()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((platforms) => {
            this.showsStore.setAllStreamingPlatforms(platforms);

            this.setSelectedPlatforms(platforms);
          }),
        )
        .subscribe();
    } else {
      this.setSelectedPlatforms(this.$streamingPlatforms());
    }
  }

  public onPlatformSelect() {
    this.showsStore.setStreamingPlatforms(this.$selectedStreamingPlatforms());
  }

  public setSelectedPlatforms(platforms: StreamingPlatformsInterface[]) {
    if (this.showsStore.$selectedPlatforms().length < 1) {
      this.showsStore.setStreamingPlatforms([
        platforms.find(
          (platform) => platform.provider_name.toLowerCase() === 'netflix',
        ) || platforms[0],
      ]);
    }

    this.$selectedStreamingPlatforms.set(this.showsStore.$selectedPlatforms());
  }
}
