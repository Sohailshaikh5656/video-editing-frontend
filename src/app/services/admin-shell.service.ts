import { Injectable, signal } from '@angular/core';

/**
 * Coordinates the admin sidebar's mobile off-canvas state between
 * `AdminNavbarComponent` (owns the hamburger button) and
 * `AdminSidebarComponent` (owns the actual drawer + backdrop) — the two
 * are siblings under `AppComponent`, so a shared signal is simpler than
 * threading an @Output up and an @Input back down.
 */
@Injectable({ providedIn: 'root' })
export class AdminShellService {
  readonly mobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
