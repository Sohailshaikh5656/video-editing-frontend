import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/common/navbar/navbar.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { AdminSidebarComponent } from './components/common/admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './components/common/admin-footer/admin-footer.component';
import { AdminNavbarComponent } from './components/common/admin-navbar/admin-navbar.component';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  token: string | null = localStorage.getItem('token');
  isAdminRoute = signal<boolean>(false);
  loadNothing = false;

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
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
    this.loadNothing = this.router.url === '/admin/login';
  }
}
