import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import {
  GenreInterface,
  ReadMoreDirective,
  ShowsService,
  movieGenres,
  tvGenres,
} from '../../core';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [RouterLink, ReadMoreDirective, RippleModule],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent {
  private readonly showsService = inject(ShowsService);
  private readonly router = inject(Router);

  private readonly allGenres = [...movieGenres, ...tvGenres];
  private readonly nextShowClosureFn = this.showsService.nextShow();

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/original';

  public readonly $selectedShow = this.showsService.$selectedShow;
  public readonly $showsResults = this.showsService.$showsResults;
  public readonly $showGenres = computed(
    () => this.$selectedShow()?.genre_ids && this.getShowGenres(),
  );
  public readonly $isWatched = signal(false);
  public readonly $showIdx = signal(0);
  public readonly $isImgLoading = signal(true);

  ngOnInit(): void {
    if (!this.$selectedShow()) {
      this.router.navigate(['/', 'app']);
      return;
    }
  }

  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  public toggleWatched() {
    this.$isWatched.update((isWatched) => !isWatched);
  }

  public nextShow(prev: boolean, next: boolean) {
    this.$isImgLoading.set(true);

    let idx = this.nextShowClosureFn(prev, next);

    this.$showIdx.set(idx || 0);
  }

  private getShowGenres(): GenreInterface[] {
    let showGenres: GenreInterface[] = [];

    for (let genreId of this.$selectedShow()!.genre_ids) {
      const genre = this.allGenres.find((genre) => genre.id === genreId);
      genre && showGenres.push(genre);
    }

    return showGenres;
  }
}

export default ShowComponent;
