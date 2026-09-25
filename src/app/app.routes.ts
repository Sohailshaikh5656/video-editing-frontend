import { Routes } from '@angular/router';

import { NotFoundComponent } from './components/other/not-found/not-found.component';
import { adminAuthGuard } from './guard/admin-auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    title: 'Cutroom',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'about',
    title: 'About',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },

  {
    path: 'services',
    title: 'Services',
    loadComponent: () =>
      import('./pages/services/services.component').then(
        (m) => m.ServicesComponent,
      ),
  },

  {
    path: 'showReels',
    title: 'Showreels',
    loadComponent: () =>
      import('./pages/showreels/showreels.component').then(
        (m) => m.ShowreelComponent,
      ),
  },

  {
    path: 'pricing',
    title: 'Pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then(
        (m) => m.PricingComponent,
      ),
  },

  {
    path: 'testimonials',
    title: 'Testimonials',
    loadComponent: () =>
      import('./pages/testimonials/testimonials.component').then(
        (m) => m.TestimonialsComponent,
      ),
  },

  {
    path: 'contact',
    title: 'Contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },

  {
    path: 'faq',
    title: 'FAQ',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
  },

  {
    path: 'process',
    title: 'Process',
    loadComponent: () =>
      import('./pages/process/process.component').then(
        (m) => m.ProcessComponent,
      ),
  },

  {
    path: 'journal',
    title: 'Journal',
    loadComponent: () =>
      import('./pages/journal/journal.component').then(
        (m) => m.JournalComponent,
      ),
  },

  // =========================
  // Admin Routes
  // =========================

  {
    path: 'admin/login',
    title: 'Admin Login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent,
      ),
  },

  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'videoTags',
        loadComponent: () =>
          import('./pages/admin/video-tag/video-tag.component').then(
            (m) => m.VideoTagsComponent,
          ),
      },
      {
        path: 'upload-file',
        loadComponent: () =>
          import('./pages/admin/upload-file-controller/upload-file-controller.component').then(
            (m) => m.UploadFileControllerComponent,
          ),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./pages/admin/videos/videos.component').then(
            (m) => m.VideosComponent,
          ),
      },
      {
        path: 'reels',
        loadComponent: () =>
          import('./pages/admin/reels/reels.component').then(
            (m) => m.ReelsComponent,
          ),
      },
      {
        path: 'reelsGenre',
        loadComponent: () =>
          import('./pages/admin/reel-genre/reel-genre.component').then(
            (m) => m.ReelGenreComponent,
          ),
      },
      {
        path: 'journalGenre',
        loadComponent: () =>
          import('./pages/admin/journal-genre/journal-genre.component').then(
            (m) => m.JournalGenreComponent,
          ),
      },
      {
        path: 'journal',
        loadComponent: () =>
          import('./pages/admin/journal/journal.component').then(
            (m) => m.JournalComponent,
          ),
      },
      {
        path: 'testimonials',
        loadComponent: () =>
          import('./pages/admin/testimonial/testimonial.component').then(
            (m) => m.TestimonialComponent,
          ),
      },
      {
        path: 'process',
        loadComponent: () =>
          import('./pages/admin/process/process.component').then(
            (m) => m.ProcessComponent,
          ),
      },
    ],
  },

  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },

  // =========================
  // 404 - ALWAYS LAST
  // =========================

  {
    path: 'not-found',
    title: 'Not Found',
    component: NotFoundComponent,
  },

  {
    path: '**',
    redirectTo: 'not-found',
  },
];
