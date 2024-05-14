import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { StreamingPlatformsInterface } from '../../core';

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [MultiSelectModule, FormsModule],
  templateUrl: './platform-list.component.html',
  styleUrl: './platform-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformListComponent {
  public readonly $streamingPlatforms = input<StreamingPlatformsInterface[]>(
    []
  );
  public readonly $selectedStreamingPlatforms = model<
    StreamingPlatformsInterface[]
  >([]);

  public readonly $platformListOutput = output<StreamingPlatformsInterface[]>();

  public onPlatformSelect() {
    this.$platformListOutput.emit(this.$selectedStreamingPlatforms());
  }

  ngOnInit() {
    this.$selectedStreamingPlatforms.set([this.$streamingPlatforms()[0]]);
    this.onPlatformSelect();
  }
}
