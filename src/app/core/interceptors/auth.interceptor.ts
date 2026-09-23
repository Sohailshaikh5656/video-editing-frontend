import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  let headers = req.headers.set('x-api-key', environment.CUT_SHORT_API_KEY);

  if (token) {
    headers = headers.set('Authorization', `${token}`);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq);
};
