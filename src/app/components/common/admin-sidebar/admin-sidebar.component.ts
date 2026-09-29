import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  link: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const COLLAPSE_KEY = 'cr-sidebar-collapsed';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  private router = inject(Router);

  /** icon-only rail mode — remembered across sessions */
  collapsed = signal<boolean>(localStorage.getItem(COLLAPSE_KEY) === '1');

  /** best-effort read of the logged-in admin's username, saved at login */
  readonly username = computed(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed?.username as string) || 'Admin';
    } catch {
      return 'Admin';
    }
  });

  readonly initials = computed(() => this.username().charAt(0).toUpperCase());

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
    localStorage.setItem(COLLAPSE_KEY, this.collapsed() ? '1' : '0');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/admin/login');
  }

  sections: NavSection[] = [
    {
      heading: 'Video Content',
      items: [
        {
          id: 'video-tags',
          label: 'Video Tags',
          icon: 'bi-tags',
          link: '/admin/videoTags',
        },
        {
          id: 'videos',
          label: 'Videos',
          icon: 'bi-film',
          link: '/admin/videos',
        },
        {
          id: 'brand',
          label: 'Brand Logo',
          icon: 'bi-award',
          link: '/admin/brand',
        },
      ],
    },
    {
      heading: 'Reels',
      items: [
        {
          id: 'reels-genre',
          label: 'Reels Genre',
          icon: 'bi-camera-reels',
          link: '/admin/reelsGenre',
        },
        {
          id: 'reels',
          label: 'Reels',
          icon: 'bi-play-btn',
          link: '/admin/reels',
        },
      ],
    },
    {
      heading: 'Journal',
      items: [
        {
          id: 'journal-category',
          label: 'Journal Category',
          icon: 'bi-bookmark',
          link: '/admin/journalGenre',
        },
        {
          id: 'journal',
          label: 'Journal',
          icon: 'bi-journal-text',
          link: '/admin/journal',
        },
      ],
    },
    {
      heading: 'Process',
      items: [
        {
          id: 'process',
          label: 'Process',
          icon: 'bi-diagram-3',
          link: '/admin/process',
        },
      ],
    },
    {
      heading: 'Testimonials',
      items: [
        {
          id: 'testimonials',
          label: 'Testimonials',
          icon: 'bi-chat-quote',
          link: '/admin/testimonials',
        },
      ],
    },
    {
      heading: 'Inquiries',
      items: [
        {
          id: 'inquiry',
          label: 'Inquiries',
          icon: 'bi-envelope-paper',
          link: '/admin/inquiry',
        },
      ],
    },
  ];
}
