export { ConfigurationService } from './services/configuration.service';
export { ShowsService } from './services/shows.service';

export { CountrieResponseModel } from './types/countrie-response.interface';
export { LanguageResponseInterface } from './types/language-response.interface';
export { StreamingPlatformsInterface } from './types/show-platforms.interface';
export {
  ShowResponseInterface,
  ShowInterface,
} from './types/show-response.interface';
export { UserLocationResponseInterface } from './types/user-location-response.interface';

export { FooterComponent } from './footer/footer.component';
export { HeaderComponent } from './header/header.component';
export { tmdbApiAuthInterceptor } from './interceptors/tmdb-api-auth.interceptor';
