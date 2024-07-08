import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export const tmdbApiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(environment.tmdbApiUrl)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.tmdbApiAccessToken}`,
      },
    });
  }

  return next(req);
};
