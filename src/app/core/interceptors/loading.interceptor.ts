import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

/**
 * Drives the global top progress bar (see AppComponent) for every request —
 * admin CRUD calls and public data fetches alike — without every component
 * having to manage its own "is an API call running" flag.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
