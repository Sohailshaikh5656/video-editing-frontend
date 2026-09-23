import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';

type NavIcon = 'play' | 'flow' | 'star' | 'help';
type NavTone = 'flare' | 'teal' | 'amber' | 'violet';

interface NavLink {
  label: string;
  path: string;
  hint?: string;
  icon?: NavIcon;
  tone?: NavTone;
}

interface Swatch {
  name: string;
  hex: string;
}

/* ───────────── accent helpers ───────────── */

const STORAGE_KEY = 'cr-accent';
const DEFAULT_ACCENT = '#ff5c2b'; // = --cr-flare in dark mode

type Rgb = [number, number, number];

/** '#abc' | 'ABCDEF' | '#aabbcc' → '#aabbcc' (or null when invalid) */
const normalizeHex = (value: string): string | null => {
  let h = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toLowerCase() : null;
};

const toRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const luminance = ([r, g, b]: Rgb): number => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const darken = (rgb: Rgb, amount: number): Rgb =>
  rgb.map((c) => Math.round(c * (1 - amount))) as Rgb;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private router = inject(Router);
  private doc = inject(DOCUMENT);
  theme = inject(ThemeService);

  open = signal(false); // mobile sheet
  moreOpen = signal(false); // "More" dropdown

  private moreEl = viewChild<ElementRef<HTMLElement>>('more');
  private closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  /** primary links (kept to 5 so the pill never overflows) */
  links: NavLink[] = [
    { label: 'Work', path: '/work' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Journal', path: '/journal' },
  ];

  /** everything else lives in the dropdown – add new pages here */
  moreLinks: NavLink[] = [
    { label: 'Showreels', path: '/showReels', hint: 'Recent cuts, front to back', icon: 'play', tone: 'violet' },
    { label: 'Process', path: '/process', hint: 'How a project runs', icon: 'flow', tone: 'flare' },
    { label: 'Testimonials', path: '/testimonials', hint: 'What clients say', icon: 'star', tone: 'amber' },
    { label: 'FAQ', path: '/faq', hint: 'Quick answers', icon: 'help', tone: 'teal' },
  ];

  /* ───────────── accent colour panel ───────────── */

  readonly swatches: Swatch[] = [
    { name: 'Flare', hex: '#ff5c2b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Lime', hex: '#84cc16' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Teal', hex: '#26d7c2' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Violet', hex: '#8b7bff' },
    { name: 'Fuchsia', hex: '#d946ef' },
  ];

  panelOpen = signal(false);
  accent = signal<string>(this.readSaved());
  hexDraft = signal<string>(this.accent().toUpperCase());
  hexInvalid = signal(false);

  accentName = computed(() => this.swatches.find((s) => s.hex === this.accent())?.name ?? 'Custom');
  isDefaultAccent = computed(() => this.accent() === DEFAULT_ACCENT);

  /** current URL after redirects */
  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  private pathOf = (url: string) => url.split(/[?#]/)[0];

  /** true on the home route → navbar renders as the compact pill */
  isHome = computed(() => this.pathOf(this.url()) === '/');

  /** highlights the "More" toggle when a dropdown page is open */
  moreActive = computed(() => this.moreLinks.some((l) => this.pathOf(this.url()) === l.path));

  constructor() {
    // every new page starts at the top (leave #anchor links alone)
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.open.set(false);
        this.moreOpen.set(false);
        this.panelOpen.set(false);
        if (!e.urlAfterRedirects.includes('#')) {
          this.doc.defaultView?.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }
      });

    // write the accent into the CSS variables (re-runs when light/dark changes)
    effect(() => this.applyAccent(this.accent(), String(this.theme.theme())));

    // lock page scroll while the panel is open
    effect(() => {
      this.doc.documentElement.style.overflow = this.panelOpen() ? 'hidden' : '';
    });
  }

  /* ───────────── dropdown ───────────── */

  toggleMore(): void {
    this.moreOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (this.moreOpen() && !this.moreEl()?.nativeElement.contains(e.target as Node)) {
      this.moreOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.moreOpen.set(false);
    this.panelOpen.set(false);
  }

  /* ───────────── panel actions ───────────── */

  openPanel(): void {
    this.open.set(false);
    this.moreOpen.set(false);
    this.panelOpen.set(true);
    setTimeout(() => this.closeBtn()?.nativeElement.focus(), 50);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  /** preset click / colour-picker change */
  setAccent(hex: string): void {
    const n = normalizeHex(hex);
    if (!n) return;
    this.accent.set(n);
    this.hexDraft.set(n.toUpperCase());
    this.hexInvalid.set(false);
    this.persist(n);
  }

  /** typing in the hex field – only commits once the value is a valid colour */
  onHexInput(value: string): void {
    this.hexDraft.set(value);
    const n = normalizeHex(value);
    this.hexInvalid.set(!n && value.trim().length > 0);
    if (n) {
      this.accent.set(n);
      this.persist(n);
    }
  }

  resetAccent(): void {
    this.setAccent(DEFAULT_ACCENT);
  }

  /* ───────────── internals ───────────── */

  private readSaved(): string {
    try {
      const saved = this.doc.defaultView?.localStorage.getItem(STORAGE_KEY);
      return (saved && normalizeHex(saved)) || DEFAULT_ACCENT;
    } catch {
      return DEFAULT_ACCENT;
    }
  }

  private persist(hex: string): void {
    try {
      const ls = this.doc.defaultView?.localStorage;
      if (!ls) return;
      if (hex === DEFAULT_ACCENT) ls.removeItem(STORAGE_KEY);
      else ls.setItem(STORAGE_KEY, hex);
    } catch {
      /* storage blocked – the choice still applies for this session */
    }
  }

  private applyAccent(hex: string, mode: string): void {
    const root = this.doc.documentElement;
    const props = ['--cr-flare', '--bs-primary-rgb', '--cr-on-flare'];

    // default → drop the overrides so your stylesheet's own dark/light values win
    if (hex === DEFAULT_ACCENT) {
      props.forEach((p) => root.style.removeProperty(p));
      return;
    }

    // light theme uses a deeper shade of the accent (like Flare 600 in your tokens)
    let rgb = toRgb(hex);
    if (mode === 'light') rgb = darken(rgb, 0.1);

    const lum = luminance(rgb);
    const onAccent = contrast(lum, 1) >= contrast(lum, luminance([14, 14, 18])) ? '#ffffff' : '#0e0e12';

    root.style.setProperty('--cr-flare', `rgb(${rgb.join(', ')})`);
    root.style.setProperty('--bs-primary-rgb', rgb.join(', '));
    root.style.setProperty('--cr-on-flare', onAccent);
  }
}