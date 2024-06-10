import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { streamingPlatforms } from '../../core';
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

  public readonly $streamingPlatforms = signal(streamingPlatforms);
  public readonly $selectedStreamingPlatforms = model<
    StreamingPlatformsInterface[]
  >([]);

  ngOnInit() {
    if (this.showsStore.$selectedPlatforms().length < 1) {
      this.showsStore.setStreamingPlatforms([this.$streamingPlatforms()[0]]);
    }

    this.$selectedStreamingPlatforms.set(this.showsStore.$selectedPlatforms());
  }

  public onPlatformSelect() {
    this.showsStore.setStreamingPlatforms(this.$selectedStreamingPlatforms());
  }
}
