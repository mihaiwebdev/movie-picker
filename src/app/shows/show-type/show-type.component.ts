import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ShowTypesEnum } from '../../core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-show-type',
  standalone: true,
  imports: [TabMenuModule, RippleModule],
  templateUrl: './show-type.component.html',
  styleUrl: './show-type.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowTypeComponent {
  public readonly showTypesEnum = ShowTypesEnum;
  public showType = ShowTypesEnum.movie;

  public readonly showTypeItems: MenuItem[] = [
    { label: 'Movies' },
    { label: 'TV Series' },
  ];
  public activeItem = this.showTypeItems[0];

  public readonly $selectShowTypeOutput = output<ShowTypesEnum>();

  public selectShowType(show: ShowTypesEnum) {
    this.showType = show;
    this.$selectShowTypeOutput.emit(show);
  }

  public onActiveItemChange($event: MenuItem) {
    if ($event.label?.toLowerCase().includes('tv')) {
      this.showType = this.showTypesEnum.tv;
    } else {
      this.showType = this.showTypesEnum.movie;
    }

    this.$selectShowTypeOutput.emit(this.showType);
  }
}
