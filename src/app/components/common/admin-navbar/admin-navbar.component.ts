import {
  Component,
  signal,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.scss',
})
export class AdminNavbarComponent {
  private el = inject(ElementRef);
  private router = inject(Router);

  isDark = signal<boolean>(this.getInitialTheme());
  profileOpen = signal<boolean>(false);
  notifOpen = signal<boolean>(false);

  private getInitialTheme(): boolean {
    const attr = document.documentElement.getAttribute('data-bs-theme');
    return attr !== 'light';
  }

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('cr-theme', next);
    this.isDark.set(next === 'dark');
  }

  toggleProfile(): void {
    this.notifOpen.set(false);
    this.profileOpen.set(!this.profileOpen());
  }

  toggleNotif(): void {
    this.profileOpen.set(false);
    this.notifOpen.set(!this.notifOpen());
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.profileOpen.set(false);
      this.notifOpen.set(false);
    }
  }
}
