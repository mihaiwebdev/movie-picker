import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ShowsService {
  private readonly http = inject(HttpClient);
  private readonly tmdbApi = environment.tmdbApiUrl;

  public getShows(
    showType: string,
    language: string,
    page: number,
    watchRegion: string,
    genres: number[],
    watchProviders: number[]
  ): Observable<any> {
    const joinedWatchProviders = watchProviders.join('|');
    const joinedGenres = genres.join(',');

    return this.http
      .get(
        `${this.tmdbApi}/discover/${showType}?language=${language}&page=${page}&sort_by=popularity.desc&watch_region=${watchRegion}&with_genres=${joinedGenres}&with_watch_providers=${joinedWatchProviders}`
      )
      .pipe(
        map((res: any) => {
          // TODO: Create an accurate scoring formula

          return res;
        })
      );
  }
}
