import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  ConfigurationService,
  ShowsService,
  StreamingPlatformsInterface,
} from '../../core';

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [MultiSelectModule, FormsModule],
  templateUrl: './platform-list.component.html',
  styleUrl: './platform-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformListComponent {
  private readonly showsService = inject(ShowsService);
  private readonly configurationService = inject(ConfigurationService);

  public readonly $streamingPlatforms = signal(
    this.configurationService.getStreamingPlatforms(),
  );
  public readonly $selectedStreamingPlatforms = model<
    StreamingPlatformsInterface[]
  >([]);

  ngOnInit() {
    if (this.showsService.$selectedPlatforms().length < 1) {
      this.showsService.setStreamingPlatforms([this.$streamingPlatforms()[0]]);
    }

    this.$selectedStreamingPlatforms.set(
      this.showsService.$selectedPlatforms(),
    );
  }

  public onPlatformSelect() {
    this.showsService.setStreamingPlatforms(this.$selectedStreamingPlatforms());
  }
}
