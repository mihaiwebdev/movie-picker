import { Component, output } from '@angular/core';
import { ShowTypesEnum } from '../../core';

@Component({
  selector: 'app-show-type',
  standalone: true,
  imports: [],
  templateUrl: './show-type.component.html',
  styleUrl: './show-type.component.css',
})
export class ShowTypeComponent {
  public readonly showTypesEnum = ShowTypesEnum;
  public showType = ShowTypesEnum.movie;

  public readonly selectShowTypeOutput = output<ShowTypesEnum>();

  public selectShowType(show: ShowTypesEnum) {
    this.showType = show;
    this.selectShowTypeOutput.emit(show);
  }
}
