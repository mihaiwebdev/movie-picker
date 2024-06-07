import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { BookmarksEnum } from './bookmarks.enum';
import { ShowsListComponent } from './shows-list/shows-list.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [TabViewModule, ShowsListComponent],
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksComponent {
  public readonly activatedRoute = inject(ActivatedRoute);
  public readonly router = inject(Router);
  public readonly $activeIndex = signal(0);
  public readonly bookmarksEnum = BookmarksEnum;

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
