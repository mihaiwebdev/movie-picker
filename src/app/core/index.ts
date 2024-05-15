// Data
export { streamingPlatforms } from './data/streaming-platforms';
export { genres } from './data/genres-data';

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

// Components
export { FooterComponent } from './footer/footer.component';
export { HeaderComponent } from './header/header.component';
export { tmdbApiAuthInterceptor } from './interceptors/tmdb-api-auth.interceptor';
