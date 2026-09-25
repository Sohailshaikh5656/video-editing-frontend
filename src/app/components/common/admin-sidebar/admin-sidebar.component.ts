import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
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
          id: 'upload-file',
          label: 'Upload File',
          icon: 'bi-cloud-arrow-up',
          link: '/admin/upload-file',
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
  ];
}
