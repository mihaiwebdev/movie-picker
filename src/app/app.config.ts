import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from './routes';
import { tmdbApiAuthInterceptor } from './core';
import { APP_BASE_HREF } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tmdbApiAuthInterceptor])),
    provideAnimationsAsync(),
    { provide: APP_BASE_HREF, useValue: '/app' },
  ],
};
