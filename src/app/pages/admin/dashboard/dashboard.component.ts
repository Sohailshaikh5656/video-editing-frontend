import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { VideoService } from '../../../services/admin/video.service';
import { VideoTagsService } from '../../../services/admin/video-tags.service';
import { BrandService } from '../../../services/admin/brand.service';
import { TestimonialService } from '../../../services/admin/testimonial.service';
import { InquiryService } from '../../../services/admin/inquiry.service';
import { LoaderComponent } from '../../../components/common/loader/loader.component';
import {
  ChartColor,
  ChartSeries,
  UplotChartComponent,
} from '../../../components/common/uplot-chart/uplot-chart.component';

interface Video {
  id: number;
  title: string;
  views: number;
  thumbnail_url: string;
  is_active: boolean | number;
  created_at: string;
  category?: string[];
}

interface Tag {
  id: number;
  tags: string;
}

interface Brand {
  id: number;
  name: string;
  image_url: string;
  is_active?: boolean | number;
}

interface Feedback {
  id: number;
  first_name: string;
  last_name: string;
  rating: number;
  occupation: string;
  country: string;
  message: string;
  is_active?: boolean | number;
  created_at?: string;
}

interface Inquiry {
  id?: number;
  full_name: string;
  company: string;
  project_type: string;
  budget: string;
  created_at?: string;
}

interface Kpi {
  label: string;
  value: number;
  decimals?: number;
  icon: string;
  color: ChartColor;
  sub: string;
  link: string;
}

const MONTHS_SHOWN = 12;
const unwrap = <T>(res: any): T[] =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

/** Backend dates arrive as ISO or "YYYY-MM-DD HH:mm:ss"; returns ms or null. */
const toMs = (value?: string): number | null => {
  if (!value) return null;
  const ms = new Date(value.replace(' ', 'T')).getTime();
  return Number.isNaN(ms) ? null : ms;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, UplotChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private videoService = inject(VideoService);
  private tagService = inject(VideoTagsService);
  private brandService = inject(BrandService);
  private feedbackService = inject(TestimonialService);
  private inquiryService = inject(InquiryService);

  readonly stars = [1, 2, 3, 4, 5];

  loading = signal(true);
  failedSources = signal<string[]>([]);
  lastUpdated = signal<Date | null>(null);

  videos = signal<Video[]>([]);
  tags = signal<Tag[]>([]);
  brands = signal<Brand[]>([]);
  feedback = signal<Feedback[]>([]);
  inquiries = signal<Inquiry[]>([]);

  /** 0 → 1 while the KPI numbers count up. */
  private progress = signal(1);
  private rafId = 0;

  // ── KPIs ──────────────────────────────────

  totalViews = computed(() => this.videos().reduce((n, v) => n + (+v.views || 0), 0));

  avgRating = computed(() => {
    const rated = this.feedback().filter((f) => f.rating > 0);
    return rated.length ? rated.reduce((n, f) => n + f.rating, 0) / rated.length : 0;
  });

  private active = (list: { is_active?: boolean | number }[]) =>
    list.filter((i) => i.is_active === undefined || !!i.is_active).length;

  kpis = computed<Kpi[]>(() => {
    const p = this.progress();
    const videos = this.videos();
    const sc = (n: number) => n * p;
    return [
      {
        label: 'Total videos',
        value: sc(videos.length),
        icon: 'bi-camera-reels',
        color: 'flare',
        sub: `${this.active(videos)} active`,
        link: '/admin/videos',
      },
      {
        label: 'Total views',
        value: sc(this.totalViews()),
        icon: 'bi-eye',
        color: 'violet',
        sub: videos.length ? `${Math.round(this.totalViews() / videos.length).toLocaleString()} avg / video` : 'No videos yet',
        link: '/admin/videos',
      },
      {
        label: 'Brands',
        value: sc(this.brands().length),
        icon: 'bi-award',
        color: 'amber',
        sub: `${this.active(this.brands())} active`,
        link: '/admin/brand',
      },
      {
        label: 'Tags',
        value: sc(this.tags().length),
        icon: 'bi-tags',
        color: 'teal',
        sub: `${this.tagUsage().length ? this.tagUsage()[0].name : '–'} is top`,
        link: '/admin/videoTags',
      },
      {
        label: 'Feedback',
        value: sc(this.feedback().length),
        icon: 'bi-chat-heart',
        color: 'flare',
        sub: this.feedback().length ? `${this.avgRating().toFixed(1)} avg rating` : 'No reviews yet',
        link: '/admin/testimonials',
      },
      {
        label: 'Inquiries',
        value: sc(this.inquiries().length),
        icon: 'bi-inbox',
        color: 'teal',
        sub: `${this.inquiriesThisMonth()} this month`,
        link: '/admin/inquiry',
      },
    ];
  });

  // ── Chart data ────────────────────────────

  /** Unix-second timestamps for the first of each of the last N months. */
  private monthStarts = computed(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_SHOWN }, (_, i) =>
      new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - i), 1),
    );
  });

  private perMonth(items: { created_at?: string }[]): number[] {
    const starts = this.monthStarts();
    const key = (d: Date) => d.getFullYear() * 12 + d.getMonth();
    const counts = new Map(starts.map((d) => [key(d), 0]));
    for (const item of items) {
      const ms = toMs(item.created_at);
      if (ms === null) continue;
      const k = key(new Date(ms));
      if (counts.has(k)) counts.set(k, counts.get(k)! + 1);
    }
    return starts.map((d) => counts.get(key(d))!);
  }

  activityX = computed(() => this.monthStarts().map((d) => d.getTime() / 1000));

  activitySeries = computed<ChartSeries[]>(() => [
    { label: 'Videos', color: 'flare', data: this.perMonth(this.videos()) },
    { label: 'Feedback', color: 'teal', data: this.perMonth(this.feedback()) },
    { label: 'Inquiries', color: 'violet', data: this.perMonth(this.inquiries()) },
  ]);

  hasActivity = computed(() => this.activitySeries().some((s) => s.data.some((n) => (n ?? 0) > 0)));

  inquiriesThisMonth = computed(() => {
    const last = this.perMonth(this.inquiries());
    return last[last.length - 1] ?? 0;
  });

  ratingCounts = computed(() =>
    this.stars.map((s) => this.feedback().filter((f) => Math.round(f.rating) === s).length),
  );
  ratingCategories = this.stars.map((s) => `${s} ★`);
  ratingX = this.stars.map((_, i) => i);
  ratingSeries = computed<ChartSeries[]>(() => [
    { label: 'Reviews', color: 'amber', data: this.ratingCounts() },
  ]);

  topVideos = computed(() =>
    [...this.videos()].sort((a, b) => (+b.views || 0) - (+a.views || 0)).slice(0, 7),
  );
  topVideosX = computed(() => this.topVideos().map((_, i) => i));
  topVideosCategories = computed(() => this.topVideos().map((v) => v.title));
  topVideosSeries = computed<ChartSeries[]>(() => [
    { label: 'Views', color: 'violet', data: this.topVideos().map((v) => +v.views || 0) },
  ]);

  tagUsage = computed(() => {
    const counts = new Map<string, number>();
    for (const t of this.tags()) counts.set(t.tags, 0);
    for (const v of this.videos())
      for (const name of v.category ?? []) counts.set(name, (counts.get(name) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });
  tagX = computed(() => this.tagUsage().map((_, i) => i));
  tagCategories = computed(() => this.tagUsage().map((t) => t.name));
  tagSeries = computed<ChartSeries[]>(() => [
    { label: 'Videos', color: 'teal', data: this.tagUsage().map((t) => t.count) },
  ]);

  // ── Lists ─────────────────────────────────

  private newest<T extends { created_at?: string }>(list: T[], n: number): T[] {
    return [...list]
      .sort((a, b) => (toMs(b.created_at) ?? 0) - (toMs(a.created_at) ?? 0))
      .slice(0, n);
  }

  latestVideos = computed(() => this.newest(this.videos(), 5));
  latestFeedback = computed(() => this.newest(this.feedback(), 4));
  latestInquiries = computed(() => this.newest(this.inquiries(), 5));
  brandList = computed(() => this.brands().slice(0, 12));

  /** Share of active videos, drives the ring in the "Content health" card. */
  activeShare = computed(() => {
    const total = this.videos().length;
    return total ? Math.round((this.active(this.videos()) / total) * 100) : 0;
  });

  // ── Lifecycle ─────────────────────────────

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  load(): void {
    this.loading.set(true);
    const failed: string[] = [];
    const safe = <T>(name: string, source$: Observable<T>) =>
      source$.pipe(
        catchError(() => {
          failed.push(name);
          return of(null);
        }),
      );

    forkJoin({
      videos: safe('videos', this.videoService.getVideo()),
      tags: safe('tags', this.tagService.getAllTags()),
      brands: safe('brands', this.brandService.getAllBrand()),
      feedback: safe('feedback', this.feedbackService.getTestimonial()),
      inquiries: safe('inquiries', this.inquiryService.getInquiry()),
    }).subscribe((res) => {
      this.videos.set(unwrap<Video>(res.videos));
      this.tags.set(unwrap<Tag>(res.tags));
      this.brands.set(unwrap<Brand>(res.brands));
      this.feedback.set(unwrap<Feedback>(res.feedback));
      this.inquiries.set(unwrap<Inquiry>(res.inquiries));
      this.failedSources.set(failed);
      this.lastUpdated.set(new Date());
      this.loading.set(false);
      this.countUp();
    });
  }

  private countUp(): void {
    cancelAnimationFrame(this.rafId);
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      this.progress.set(1 - Math.pow(1 - t, 3));
      if (t < 1) this.rafId = requestAnimationFrame(tick);
    };
    this.progress.set(0);
    this.rafId = requestAnimationFrame(tick);
  }

  // ── Template helpers ──────────────────────

  fullName(f: Feedback): string {
    return `${f.first_name ?? ''} ${f.last_name ?? ''}`.trim() || 'Anonymous';
  }

  initials(name: string): string {
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?'
    );
  }

  asDate(value?: string): Date | null {
    const ms = toMs(value);
    return ms === null ? null : new Date(ms);
  }
}
