import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [],
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingComponent {}
