import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import {
  ConfigurationService,
  GenreInterface,
  ReadMoreDirective,
  ShowInterface,
  ShowsService,
  StorageService,
} from '../../core';
import { RippleModule } from 'primeng/ripple';

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
  private readonly configService = inject(ConfigurationService);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  private readonly allGenres = [
    ...this.configService.getMovieGenres(),
    ...this.configService.getTvGenres(),
  ];

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w1280';
  public readonly showFromStorage = this.storageService.getFromLocalStorage(
    environment.showLsKey,
  ) as ShowInterface;

  public readonly $selectedShow = this.showsService.$selectedShow;
  public readonly $showGenres = signal<GenreInterface[]>([]);
  public readonly $isWatched = signal(false);

  ngOnInit(): void {
    if (this.$selectedShow()) {
      this.storageService.setToLocalStorage(
        environment.showLsKey,
        this.$selectedShow(),
      );
    }

    if (!this.$selectedShow() && this.showFromStorage) {
      this.showsService.setSelectedShow(this.showFromStorage);
    }

    if (!this.$selectedShow() && !this.showFromStorage) {
      this.router.navigate(['/']);
      return;
    }

    this.$showGenres.set(this.getShowGenres());
  }

  public toggleWatched() {
    this.$isWatched.update((isWatched) => !isWatched);
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
