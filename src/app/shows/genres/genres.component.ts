import { Component, input, model, output } from '@angular/core';
import { GenreInterface } from '../../core';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [MultiSelectModule, FormsModule],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.css',
})
export class GenresComponent {
  public readonly $genres = input<GenreInterface[]>([]);
  public readonly $selectedGenres = model<GenreInterface[]>([]);

  public readonly $selectGenresOutput = output<GenreInterface[]>();

  public onGenreChange(): void {
    this.$selectGenresOutput.emit(this.$selectedGenres());
  }
}
