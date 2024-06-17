import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { ShowsService, ShowsStore } from '../../core';
import { UserDataService } from '../../core/services/user-data.service';
import { ShowInterface } from '../../shared';
import { BookmarksEnum } from '../bookmarks.enum';

@Component({
  selector: 'app-shows-list',
  standalone: true,
  imports: [
    DataViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    SkeletonModule,
    FormsModule,
    InputTextModule,
    FloatLabelModule,
  ],
  templateUrl: './shows-list.component.html',
  styleUrl: './shows-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowsListComponent {
  private readonly showsService = inject(ShowsService);
  private readonly showsStore = inject(ShowsStore);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly userDataService = inject(UserDataService);
  private readonly $currentUser = this.userDataService.$currentUser;
  private readonly $width = signal(window.innerWidth);
  private currentPage = 0;

  public readonly $bookmarkType = input.required<BookmarksEnum>();
  public readonly $searchValue = model<string>('');
  public readonly $shows = signal<ShowInterface[]>([]);
  public readonly $filteredShows = computed(() =>
    this.filterShows(this.$searchValue()),
  );
  public readonly $isGetShowsLoading = signal(false);
  public readonly $isRemoveLoading = signal(false);
  public readonly $isImgLoading = signal(true);
  public readonly $rows = computed(() =>
    this.$width() >= 1200
      ? 12
      : this.$width() >= 1024
        ? 9
        : this.$width() >= 768
          ? 6
          : 5,
  );
  public readonly $rowsArray = computed(() => Array(this.$rows()));
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w342';

  ngOnInit() {
    this.getAllShows();
  }

  public filterShows(value: string) {
    if (value.length > 0) {
      return this.$shows().filter((show) =>
        (show.title || show.name || '')
          .trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase()),
      );
    } else {
      return this.$shows();
    }
  }

  public removeShow($event: Event, showId: number) {
    $event.stopPropagation();
    if (!this.$currentUser()?.uid) return;

    this.$isRemoveLoading.set(true);

    this.showsService
      .removeShow(
        String(showId),
        String(this.$currentUser()?.uid),
        this.$bookmarkType(),
      )
      .pipe(
        tap(() => {
          this.$shows.update((shows) =>
            shows.filter((show) => show.id !== showId),
          );
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get remove the show',
          });
          return of(err);
        }),
        finalize(() => this.$isRemoveLoading.set(false)),
      )
      .subscribe();
  }

  public openShow(show: ShowInterface) {
    this.showsStore.setSelectedShow(show);
    this.showsStore.setResultPages(1);
    this.showsStore.setShowsResults([show]);

    this.router.navigateByUrl('/app/movie');
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }
  public setImageLoading(event: any) {
    if (this.currentPage === event.first) return;

    this.currentPage = event.first;
    this.$isImgLoading.set(true);
  }

  private getAllShows() {
    if (!this.$currentUser()?.uid) return;

    this.$isGetShowsLoading.set(true);
    this.getAllShowsRequest()
      .pipe(
        tap((res) => {
          let shows: ShowInterface[] = [];
          res.forEach((show) => shows.push(show.data() as ShowInterface));
          this.$shows.set(shows);
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not get the watched shows',
          });
          return of(err);
        }),
        finalize(() => this.$isGetShowsLoading.set(false)),
      )
      .subscribe();
  }

  private getAllShowsRequest(): Observable<
    QuerySnapshot<DocumentData, DocumentData>
  > {
    if (this.$bookmarkType() === BookmarksEnum.watched) {
      return this.showsService.getAllWatchedShows(this.$currentUser()!.uid);
    }

    if (this.$bookmarkType() === BookmarksEnum.hidden) {
      return this.showsService.getAllHidden(this.$currentUser()!.uid);
    }

    return this.showsService.getAllFromWatchlist(this.$currentUser()!.uid);
  }
}
