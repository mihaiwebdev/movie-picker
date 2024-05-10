import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { register } from 'swiper/element/bundle';
import { GenreInterface } from '../../core';

@Component({
  selector: 'app-show-genres',
  standalone: true,
  imports: [FormsModule, ChipsModule, ReactiveFormsModule],
  templateUrl: './show-genres.component.html',
  styleUrl: './show-genres.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowGenresComponent implements AfterViewInit, OnInit {
  private readonly formBuilder = inject(FormBuilder);
  public readonly iconBasePath = '../../../assets/icons/';

  public readonly $genres = input<GenreInterface[]>([]);
  public readonly $selectGenresOutput = output<GenreInterface[]>();

  private get selectedGenresControl() {
    return this.genresForm.controls['selectedGenres'];
  }
  public get selectedGenresNames() {
    return this.genresForm.controls['selectedGenresNames'];
  }
  public readonly genresForm = this.formBuilder.group({
    selectedGenresNames: this.formBuilder.control<string[] | undefined>(
      undefined
    ),
    selectedGenres: this.formBuilder.control<GenreInterface[]>([]),
  });

  // SWIPER Config
  public readonly breakpoints = {
    breakpoints: {
      320: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      480: {
        slidesPerView: 5,
        spaceBetween: 40,
      },
      640: {
        slidesPerView: 6,
        spaceBetween: 40,
      },

      780: {
        slidesPerView: 7,
        spaceBetween: 50,
      },
      920: {
        slidesPerView: 8,
        spaceBetween: 50,
      },
      1100: {
        slidesPerView: 9,
        spaceBetween: 50,
      },
    },
  };

  public readonly pagination = {
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
    },
  };

  ngOnInit(): void {
    register();

    this.selectedGenresControl.valueChanges.subscribe((res) =>
      this.selectedGenresNames.setValue(res?.map((genre) => genre.name))
    );
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;

  ngAfterViewInit() {
    Object.assign(this.mySwiper?.nativeElement, this.breakpoints);
    Object.assign(this.mySwiper?.nativeElement, this.pagination);

    this.mySwiper?.nativeElement.initialize();
  }

  public onGenreSelect(selectedGenre: GenreInterface) {
    if (!this.selectedGenresControl.value) return;

    if (this.isGenreSelected(selectedGenre.id)) {
      const filteredGenres = this.selectedGenresControl.value.filter(
        (genre) => genre.id !== selectedGenre.id
      );

      this.selectedGenresControl.setValue(filteredGenres);
    } else {
      const selectedGenres = [
        ...this.selectedGenresControl.value,
        selectedGenre,
      ];
      this.selectedGenresControl.setValue(selectedGenres);
    }
  }

  public isGenreSelected(genreId: number) {
    return this.selectedGenresControl.value?.find(
      (genre) => genreId === genre.id
    );
  }

  public onChipRemove($event: any) {
    if (!this.selectedGenresControl.value) return;

    const filteredGenres = this.selectedGenresControl.value.filter(
      (genre) => genre.name.toLowerCase() !== $event.value.toLowerCase()
    );

    this.selectedGenresControl.setValue(filteredGenres);
  }
}
