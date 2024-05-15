// Data
export { streamingPlatforms } from './data/streaming-platforms';
export { movieGenres } from './data/genres-data';
export { tvGenres } from './data/genres-data';

// Services
export { ConfigurationService } from './services/configuration.service';
export { ShowsService } from './services/shows.service';
export { StorageService } from './services/storage.service';

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
export { FooterComponent } from './components/footer/footer.component';
export { HeaderComponent } from './components/header/header.component';
export { tmdbApiAuthInterceptor } from './interceptors/tmdb-api-auth.interceptor';
