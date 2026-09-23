import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>((localStorage.getItem('theme') as Theme) || 'dark');

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-bs-theme', t);
      localStorage.setItem('theme', t);
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}