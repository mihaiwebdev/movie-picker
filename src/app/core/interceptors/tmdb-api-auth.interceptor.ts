import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export const tmdbApiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(environment.tmdbApiUrl)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.tmdbApiAccessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      console.log(err);
      return of(err);
    })
  );
};
