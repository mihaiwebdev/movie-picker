import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ShowInterface, ShowsService, StorageService } from '../../core';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent {
  private readonly showsService = inject(ShowsService);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w1280';
  public readonly $selectedShow = this.showsService.$selectedShow;
  public readonly showFromStorage = this.storageService.getFromLocalStorage(
    'show',
  ) as ShowInterface;

  ngOnInit(): void {
    if (this.$selectedShow()) {
      this.storageService.setToLocalStorage('show', this.$selectedShow());
    }

    if (!this.$selectedShow() && this.showFromStorage) {
      this.showsService.setSelectedShow(this.showFromStorage);
    }

    if (!this.$selectedShow() && !this.showFromStorage) {
      this.router.navigate(['/']);
    }
  }
}

export default ShowComponent;
