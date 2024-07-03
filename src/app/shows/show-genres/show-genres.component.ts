import { MoodsInterface } from './../../shared/types/moods.interface';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  model,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { SelectButtonModule } from 'primeng/selectbutton';
import { register } from 'swiper/element/bundle';
import { movieGenres, ShowsStore, tvGenres } from '../../core';
import { GenreInterface, ShowTypesEnum } from '../../shared';
import { movieMoods, tvMoods } from '../../core/data/moods-data';

@Component({
  selector: 'app-show-genres',
  standalone: true,
  imports: [FormsModule, ChipsModule, ReactiveFormsModule, SelectButtonModule],
  templateUrl: './show-genres.component.html',
  styleUrl: './show-genres.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowGenresComponent implements AfterViewInit, OnInit {
  private readonly showsStore = inject(ShowsStore);
  private readonly formBuilder = inject(FormBuilder);
  private isFirstChange = true;

  public readonly iconBasePath = '../../../assets/icons/';
  public readonly moodIconPath = '../../../assets/mood-icons/';
  public readonly $movieGenres = signal<GenreInterface[]>(movieGenres);
  public readonly $movieMoods = signal<MoodsInterface[]>(movieMoods);
  public readonly $showGenres = signal<GenreInterface[]>(tvGenres);
  public readonly $showMoods = signal<MoodsInterface[]>(tvMoods);
  public readonly $selectedShowType = this.showsStore.$selectedShowType;
  public readonly $selectButtonValue = model<'mood' | 'genres'>(
    this.showsStore.$selectedGenreMode(),
  );
  public readonly stateOptions: any[] = [
    { label: 'Mood', value: 'mood' },
    { label: 'Genres', value: 'genres' },
  ];
  public readonly $selectedMoodName = signal<string>('');

  private get selectedGenresControl() {
    return this.genresForm.controls['selectedGenres'];
  }
  public get selectedGenresNames() {
    return this.genresForm.controls['selectedGenresNames'];
  }
  public readonly genresForm = this.formBuilder.group({
    selectedGenresNames: this.formBuilder.control<string[] | undefined>(
      this.showsStore.$selectedGenres().map((genre) => genre.name),
    ),
    selectedGenres: this.formBuilder.control<GenreInterface[]>(
      this.showsStore.$selectedGenres(),
    ),
  });

  // SWIPER Config
  public readonly breakpoints = {
    slidesPerView: 3,
    spaceBetween: 20,
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

  public readonly moviePagination = {
    pagination: {
      el: '.swiper-pagination-movie',
      type: 'bullets',
    },
  };

  public readonly tvPagination = {
    pagination: {
      el: '.swiper-pagination-tv',
      type: 'bullets',
    },
  };

  constructor() {
    effect(() => {
      if (this.$selectedShowType() === ShowTypesEnum.movie) {
        this.tvSwiper?.nativeElement.parentElement.classList.remove('show');
        this.movieSwiper?.nativeElement.parentElement.classList.add('show');
      } else {
        this.movieSwiper?.nativeElement.parentElement.classList.remove('show');
        this.tvSwiper?.nativeElement.parentElement.classList.add('show');
      }

      if (!this.isFirstChange) {
        this.selectedGenresControl.reset([]);
        this.selectedGenresNames.reset([]);
      }

      this.isFirstChange = false;
    });
  }
  ngOnInit(): void {
    register();

    this.selectedGenresControl.valueChanges.subscribe((res) =>
      this.selectedGenresNames.setValue(res?.map((genre) => genre.name)),
    );

    if (this.$selectButtonValue() === 'mood') {
      this.showsStore.setSelectedGenres([]);
    }
  }

  @ViewChild('movieSwiper') movieSwiper?: ElementRef;
  @ViewChild('tvSwiper') tvSwiper?: ElementRef;

  // Initialize tv swiper and movie swiper
  ngAfterViewInit() {
    Object.assign(this.movieSwiper?.nativeElement, this.breakpoints);
    Object.assign(this.movieSwiper?.nativeElement, this.moviePagination);
    this.movieSwiper?.nativeElement.parentElement.classList.add('show');
    this.movieSwiper?.nativeElement.initialize();

    Object.assign(this.tvSwiper?.nativeElement, this.breakpoints);
    Object.assign(this.tvSwiper?.nativeElement, this.tvPagination);
    this.tvSwiper?.nativeElement.parentElement.classList.add('show');
    this.tvSwiper?.nativeElement.initialize();
  }

  public onGenreSelect(selectedGenre: GenreInterface) {
    if (!this.selectedGenresControl.value) return;

    if (this.isGenreSelected(selectedGenre.id)) {
      const filteredGenres = this.selectedGenresControl.value.filter(
        (genre) => genre.id !== selectedGenre.id,
      );

      this.selectedGenresControl.setValue(filteredGenres);
    } else {
      const selectedGenres = [
        ...this.selectedGenresControl.value,
        selectedGenre,
      ];
      this.selectedGenresControl.setValue(selectedGenres);
    }

    this.showsStore.setSelectedGenres(this.selectedGenresControl.value);
  }

  public onMoodSelect(mood: MoodsInterface) {
    this.$selectedMoodName.set(mood.name);

    const selectedGenres = this.$movieGenres().filter((genre) =>
      mood.genre_ids.includes(genre.id),
    );

    this.showsStore.setSelectedGenres(selectedGenres);
  }

  public onTvMoodSelect(mood: MoodsInterface) {
    this.$selectedMoodName.set(mood.name);

    const selectedGenres = this.$showGenres().filter((genre) =>
      mood.genre_ids.includes(genre.id),
    );

    this.showsStore.setSelectedGenres(selectedGenres);
  }

  public clearSelectedGenres() {
    this.showsStore.setSelectedGenres([]);
    this.$selectedMoodName.set('');

    this.selectedGenresControl.setValue([]);
    this.selectedGenresNames.setValue([]);

    this.showsStore.setSelectedGenreMode(this.$selectButtonValue());
  }

  public isGenreSelected(genreId: number) {
    return this.selectedGenresControl.value?.find(
      (genre) => genreId === genre.id,
    );
  }

  public onChipRemove($event: any) {
    if (!this.selectedGenresControl.value) return;

    const filteredGenres = this.selectedGenresControl.value.filter(
      (genre) => genre.name.toLowerCase() !== $event.value.toLowerCase(),
    );

    this.selectedGenresControl.setValue(filteredGenres);

    this.showsStore.setSelectedGenres(this.selectedGenresControl.value);
  }
}
