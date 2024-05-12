import { Component } from '@angular/core';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css',
})
export class ShowComponent {
  public readonly movieData = {
    adult: false,
    backdrop_path: '/fypydCipcWDKDTTCoPucBsdGYXW.jpg',
    genre_ids: [878, 12, 28],
    id: 653346,
    original_language: 'en',
    original_title: 'Kingdom of the Planet of the Apes',
    overview:
      "Several generations in the future following Caesar's reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows. As a new tyrannical ape leader builds his empire, one young ape undertakes a harrowing journey that will cause him to question all that he has known about the past and to make choices that will define a future for apes and humans alike.",
    popularity: 1291,
    poster_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    release_date: '2024-05-08',
    title: 'Kingdom of the Planet of the Apes',
    video: false,
    vote_average: 6.875,
    vote_count: 52,
  };
  public readonly imgBaseUrl = 'https://image.tmdb.org/t/p/w1280';
}

export default ShowComponent;
