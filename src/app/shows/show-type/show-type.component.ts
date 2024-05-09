import { Component, output } from '@angular/core';
import { ShowTypesEnum } from '../../core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-show-type',
  standalone: true,
  imports: [TabMenuModule],
  templateUrl: './show-type.component.html',
  styleUrl: './show-type.component.css',
})
export class ShowTypeComponent {
  public readonly showTypesEnum = ShowTypesEnum;
  public showType = ShowTypesEnum.movie;

  public readonly showTypeItems: MenuItem[] = [
    { label: 'Movies' },
    { label: 'Tv Series' },
  ];
  public activeItem = this.showTypeItems[0];

  public readonly selectShowTypeOutput = output<ShowTypesEnum>();

  public selectShowType(show: ShowTypesEnum) {
    this.showType = show;
    this.selectShowTypeOutput.emit(show);
  }

  public onActiveItemChange($event: MenuItem) {
    if ($event.label?.toLowerCase().includes('tv')) {
      this.showType = this.showTypesEnum.tv;
    } else {
      this.showType = this.showTypesEnum.movie;
    }
  }
}
