// Data
export { streamingPlatforms } from './data/streaming-platforms';
export { movieGenres } from './data/genres-data';
export { tvGenres } from './data/genres-data';

// Services
export { ShowsService } from './services/shows.service';
export { StorageService } from './services/storage.service';
export { UserDataService } from './services/user-data.service';

// Enumes
export { ShowTypesEnum } from './enums/show-types.enum';

// Interfaces
export { GenreInterface } from './types/genres-response.interface';
export { StreamingPlatformsInterface } from './types/show-platforms.interface';
export {
  ShowInterface,
  ShowResponseInterface,
} from './types/show-response.interface';
export { UserLocationResponseInterface } from './types/user-location-response.interface';

// Directives
export { ReadMoreDirective } from './directives/read-more.directive';

// Components
export { HeaderComponent } from './components/header/header.component';
export { tmdbApiAuthInterceptor } from './interceptors/tmdb-api-auth.interceptor';
