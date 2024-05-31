import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { WatchedShowsComponent } from './watched-shows/watched-shows.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [TabViewModule, WatchedShowsComponent],
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksComponent {
  public readonly activatedRoute = inject(ActivatedRoute);
  public readonly router = inject(Router);
  public readonly $activeIndex = signal(0);

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((res) => {
      if (res.has('tab')) {
        this.$activeIndex.set(+res.get('tab')!);
      }
    });
  }

  public changeTabIndex(index: number) {
    this.$activeIndex.set(index);
    this.router.navigateByUrl(`/app/bookmarks?tab=${index}`);
  }
}

export default BookmarksComponent;
