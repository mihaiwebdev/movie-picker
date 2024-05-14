import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ShowsService } from '../../core';

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

  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w1280';
  public readonly $selectedShow = this.showsService.$selectedShow;

  ngOnInit(): void {
    if (!this.$selectedShow()) {
      this.router.navigate(['/']);
    }
  }
}

export default ShowComponent;
