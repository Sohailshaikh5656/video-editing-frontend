import { Injectable, signal } from '@angular/core';

/**
 * Tracks how many HTTP requests are currently in flight, app-wide.
 * Written to by `loadingInterceptor`; read by the global top progress bar in
 * `AppComponent`. Kept as a plain counter (not a boolean) so overlapping
 * requests don't cause the bar to flicker off before the last one settles.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly count = signal(0);
  readonly isLoading = signal(false);

  start(): void {
    this.count.update((n) => n + 1);
    this.isLoading.set(true);
  }

  stop(): void {
    this.count.update((n) => Math.max(0, n - 1));
    if (this.count() === 0) this.isLoading.set(false);
  }
}
