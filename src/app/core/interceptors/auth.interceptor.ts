import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Set on a request's `HttpContext` to skip the internal auth headers.
 *
 * Used for third-party endpoints (e.g. Cloudinary uploads) that must never
 * receive our internal `x-api-key` / `Authorization` values.
 */
export const SKIP_AUTH_HEADERS = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  if (req.context.get(SKIP_AUTH_HEADERS)) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  let headers = req.headers.set('x-api-key', environment.CUT_SHORT_API_KEY);

  if (token) {
    headers = headers.set('Authorization', `${token}`);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error?.keyword === 'Invalid_Token_Provided') {
        localStorage.removeItem('token');
        router.navigateByUrl('/admin/login');
      }

      return throwError(() => error);
    }),
  );
};
