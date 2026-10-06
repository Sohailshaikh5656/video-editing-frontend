import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/common/navbar/navbar.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { AdminSidebarComponent } from './components/common/admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './components/common/admin-footer/admin-footer.component';
import { AdminNavbarComponent } from './components/common/admin-navbar/admin-navbar.component';
import { MaintenanceComponent } from './components/other/maintenance/maintenance.component';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AdminFooterComponent,
    AdminSidebarComponent,
    AdminNavbarComponent,
    MaintenanceComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // When true, every route (public and admin) is replaced by the maintenance page.
  isUnderMaintanace: boolean = true;
  readonly loading = inject(LoadingService);
  token: string | null = localStorage.getItem('token');
  isAdminRoute = signal<boolean>(window.location.pathname.startsWith('/admin'));
  loadNothing = window.location.pathname === '/admin/login';

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
        this.loadNothing = event.urlAfterRedirects === '/admin/login';
        this.token = localStorage.getItem('token');
      });
    // no need for the manual sync calls after this — window.location already got it right
  }
}
