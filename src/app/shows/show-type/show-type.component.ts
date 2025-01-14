import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TabMenuModule } from 'primeng/tabmenu';
import { ShowsStore } from '../../core';
import { ShowTypesEnum } from '../../shared';

@Component({
  selector: 'app-show-type',
  standalone: true,
  imports: [TabMenuModule, RippleModule],
  templateUrl: './show-type.component.html',
  styleUrl: './show-type.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowTypeComponent {
  private readonly showsStore = inject(ShowsStore);
  private isFirstChange = true;

  public readonly showTypesEnum = ShowTypesEnum;
  public readonly $showType = this.showsStore.$selectedShowType;

  public readonly showTypeItems: MenuItem[] = [
    { label: 'Movies' },
    { label: 'TV Series' },
  ];
  public activeItem =
    this.$showType() === this.showTypesEnum.movie
      ? this.showTypeItems[0]
      : this.showTypeItems[1];

  public selectShowType(show: ShowTypesEnum) {
    if (!this.isFirstChange) {
      this.showsStore.setSelectedGenres([]);
    }
    this.isFirstChange = false;
    this.showsStore.setSelectedShowType(show);
  }

  public onActiveItemChange($event: any) {
    if ($event.label?.toLowerCase().includes('tv')) {
      this.selectShowType(this.showTypesEnum.tv);
    } else {
      this.selectShowType(this.showTypesEnum.movie);
    }
  }
}
