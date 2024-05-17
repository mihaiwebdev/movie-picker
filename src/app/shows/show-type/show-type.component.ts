import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TabMenuModule } from 'primeng/tabmenu';
import { ShowTypesEnum, ShowsService } from '../../core';

@Component({
  selector: 'app-show-type',
  standalone: true,
  imports: [TabMenuModule, RippleModule],
  templateUrl: './show-type.component.html',
  styleUrl: './show-type.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowTypeComponent {
  private readonly showsService = inject(ShowsService);
  private isFirstChange = true;

  public readonly showTypesEnum = ShowTypesEnum;
  public readonly $showType = this.showsService.$selectedShowType;
  public readonly $selectShowTypeOutput = output<ShowTypesEnum>();
  public readonly showTypeItems: MenuItem[] = [
    { label: 'Movies' },
    { label: 'TV Series' },
  ];
  public activeItem =
    this.$showType() === this.showTypesEnum.movie
      ? this.showTypeItems[0]
      : this.showTypeItems[1];

  public selectShowType(show: ShowTypesEnum) {
    this.showsService.setSelectedShowType(show);
    this.$selectShowTypeOutput.emit(show);
  }

  public onActiveItemChange($event: any) {
    if (!this.isFirstChange) {
      this.showsService.setSelectedGenres([]);
    }

    if ($event.label?.toLowerCase().includes('tv')) {
      this.selectShowType(this.showTypesEnum.tv);
    } else {
      this.selectShowType(this.showTypesEnum.movie);
    }

    this.isFirstChange = false;
  }
}
