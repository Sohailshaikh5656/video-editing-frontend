import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Set on a request's `HttpContext` to skip the internal auth headers.
 *
 * Used for third-party endpoints (e.g. Cloudinary uploads) that must never
 * receive our internal `x-api-key` / `Authorization` values.
 */
export const SKIP_AUTH_HEADERS = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_HEADERS)) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  let headers = req.headers.set('x-api-key', environment.CUT_SHORT_API_KEY);

  if (token) {
    headers = headers.set('Authorization', `${token}`);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq);
};
