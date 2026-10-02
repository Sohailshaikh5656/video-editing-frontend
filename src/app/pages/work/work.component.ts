import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { SharedModule } from '../../shared/sharedModule';
import { RevealDirective } from '../../shared/reveal.directive';
import { UserControllerService } from '../../services/user-controller.service';
import {
  ChartSeries,
  UplotChartComponent,
} from '../../components/common/uplot-chart/uplot-chart.component';

type Tone = 'flare' | 'teal' | 'amber' | 'violet';
const TONES: Tone[] = ['flare', 'teal', 'violet', 'amber'];

interface ApiVideo {
  id: number;
  vedio_url: string;
  thumbnail_url: string;
  title: string;
  name: string;
  description: string;
  views: number;
  is_active: number;
  is_deleted: number;
  created_at: string;
  category: string[];
}

interface Project {
  id: number;
  title: string;
  client: string;
  description: string;
  tags: string[];
  views: number;
  year: string;
  createdAt: number | null;
  video: string;
  poster: string;
  tone: Tone;
}

interface Step {
  icon: string;
  title: string;
  text: string;
  tools: string[];
  time: string;
}

interface AdobeTool {
  code: string;
  name: string;
  role: string;
  level: number;
  skills: string[];
  tone: Tone;
}

interface ExportPreset {
  icon: string;
  name: string;
  spec: string;
  use: string;
}

/** Shown only until the API returns real videos, so the section is never empty. */
const SAMPLE_PROJECTS: Project[] = [
  ['Aurora — Brand Film', 'Aurora Studio', 'A 90-second launch film cut to a custom score, with kinetic type and a graded teal-and-orange look.', ['Brand', 'Motion']],
  ['Vows at Dusk', 'Hale & Co.', 'A wedding highlight reel that keeps the emotion and drops the filler — three cameras, one story.', ['Wedding', 'Cinematic']],
  ['Neon Nights', 'Kite Records', 'Music video edit with beat-synced cuts, glitch transitions and a full VFX pass.', ['Music', 'VFX']],
  ['Pitch in 60', 'Northwind', 'Product launch reel with screen capture, animated callouts and clean voice-over.', ['Product', 'Reels']],
  ['The Long Road', 'Wander Weekly', 'Travel vlog episode with drone footage, ambient sound design and chapter titles.', ['Travel', 'Vlog']],
  ['Founders Unfiltered', 'Podcast Labs', 'Podcast cutdowns for social: captions, waveforms and punchy vertical edits.', ['Podcast', 'Reels']],
].map(([title, client, description, tags], i) => ({
  id: -(i + 1),
  title: title as string,
  client: client as string,
  description: description as string,
  tags: tags as string[],
  views: 0,
  year: String(new Date().getFullYear()),
  createdAt: null,
  video: '',
  poster: '',
  tone: TONES[i % TONES.length],
}));

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

const formatViews = (n: number): string =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    : n >= 1_000
      ? (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
      : String(n);

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [SharedModule, RouterLink, RevealDirective, UplotChartComponent],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent implements OnInit, OnDestroy {
  constructor(private userController: UserControllerService) {}

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // ── Showcase ──────────────────────────────

  readonly ALL = 'All';
  loaded = signal(false);
  live = signal(false);
  projects = signal<Project[]>(SAMPLE_PROJECTS);
  activeTag = signal(this.ALL);
  rating = signal<number | null>(null);

  tags = computed(() => [
    this.ALL,
    ...new Set(this.projects().flatMap((p) => p.tags)),
  ]);

  visible = computed(() => {
    const tag = this.activeTag();
    return tag === this.ALL
      ? this.projects()
      : this.projects().filter((p) => p.tags.includes(tag));
  });

  stats = computed(() => {
    const list = this.projects();
    const views = list.reduce((n, p) => n + p.views, 0);
    return [
      { value: String(list.length), label: 'Projects delivered' },
      { value: this.live() ? formatViews(views) : '2.4M', label: 'Views generated' },
      { value: this.rating() ? this.rating()!.toFixed(1) : '4.9', label: 'Average client rating' },
      { value: '72h', label: 'Typical first cut' },
    ];
  });

  // ── Charts ────────────────────────────────

  hoursCategories = ['Ingest', 'Script', 'Edit', 'Motion', 'Grade', 'Sound', 'Revise', 'Export'];
  hoursX = this.hoursCategories.map((_, i) => i);
  hoursSeries: ChartSeries[] = [
    { label: 'Hours', color: 'flare', data: [2, 4, 14, 10, 5, 4, 5, 3] },
  ];

  /** A typical 14-day project: each stage ramps 0→100% inside its own window. */
  private stages: { label: string; color: ChartSeries['color']; start: number; span: number }[] = [
    { label: 'Upload', color: 'flare', start: 0, span: 2 },
    { label: 'Editing', color: 'teal', start: 1, span: 7 },
    { label: 'Revisions', color: 'amber', start: 6, span: 6 },
    { label: 'Rendering', color: 'violet', start: 10, span: 3 },
    { label: 'Delivery', color: 'text-hi', start: 12, span: 2 },
  ];
  progressX = Array.from({ length: 15 }, (_, d) => d);
  progressSeries: ChartSeries[] = this.stages.map((s) => ({
    label: s.label,
    color: s.color,
    data: this.progressX.map((d) => Math.round(smooth((d - s.start) / s.span) * 100)),
  }));
  dayLabel = (d: number) => `Day ${d}`;
  percent = (v: number) => `${v}%`;

  deliveredX = computed(() => this.monthStarts().map((d) => d.getTime() / 1000));
  deliveredSeries = computed<ChartSeries[]>(() => {
    const starts = this.monthStarts();
    const key = (d: Date) => d.getFullYear() * 12 + d.getMonth();
    const counts = new Map(starts.map((d) => [key(d), 0]));
    for (const p of this.projects()) {
      if (p.createdAt === null) continue;
      const k = key(new Date(p.createdAt));
      if (counts.has(k)) counts.set(k, counts.get(k)! + 1);
    }
    return [{ label: 'Projects delivered', color: 'teal', data: starts.map((d) => counts.get(key(d))!) }];
  });
  hasDelivered = computed(() => this.deliveredSeries()[0].data.some((n) => (n ?? 0) > 0));

  private monthStarts = computed(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (11 - i), 1));
  });

  /** Mock "live" project tracker. */
  tracker = [
    { label: 'Upload & ingest', pct: 100, state: 'done' },
    { label: 'Editing', pct: 100, state: 'done' },
    { label: 'Revisions · round 2', pct: 72, state: 'active' },
    { label: 'Rendering', pct: 30, state: 'active' },
    { label: 'Final delivery', pct: 0, state: 'pending' },
  ];

  // ── Workflow ──────────────────────────────

  steps: Step[] = [
    { icon: 'bi-cloud-arrow-up', title: 'Raw footage', time: 'Day 0–1', text: 'You send rushes, brand assets and references. We transcode proxies, sync audio and organise bins so nothing gets lost.', tools: ['Frame.io', 'Premiere Pro'] },
    { icon: 'bi-journal-text', title: 'Script & plan', time: 'Day 1–2', text: 'We turn the brief into a script, beat sheet and shot list so every cut has a reason before we touch the timeline.', tools: ['Notion', 'Storyboards'] },
    { icon: 'bi-scissors', title: 'Rough cut', time: 'Day 2–4', text: 'Story first: selects, pacing and structure with scratch audio, ready for your first round of notes.', tools: ['Premiere Pro'] },
    { icon: 'bi-magic', title: 'Motion & VFX', time: 'Day 4–7', text: 'Titles, transitions, tracking, cleanup and animated graphics that match your brand system.', tools: ['After Effects', 'Photoshop'] },
    { icon: 'bi-palette', title: 'Grade & sound', time: 'Day 7–9', text: 'Colour grade, skin-tone balance, noise reduction, mix and loudness mastering for every platform.', tools: ['Lumetri', 'Audition'] },
    { icon: 'bi-chat-square-text', title: 'Review', time: 'Day 9–12', text: 'Timestamped feedback, tight revision rounds and a locked picture you can sign off with confidence.', tools: ['Frame.io'] },
    { icon: 'bi-send-check', title: 'Export & deliver', time: 'Day 12–14', text: 'Platform-ready exports, captions, thumbnails and a clean archive of project files in your inbox.', tools: ['Media Encoder'] },
  ];
  activeStep = signal(0);
  stepFill = computed(() => (this.activeStep() / (this.steps.length - 1)) * 100);
  private stepTimer?: ReturnType<typeof setInterval>;

  // ── Scripting ─────────────────────────────

  scriptLines = [
    { kind: 'scene', text: 'INT. STUDIO — DAY' },
    { kind: 'action', text: 'Slow push-in on a founder at her desk. Sunlight, steam from a cup.' },
    { kind: 'vo', text: 'V.O.  Every great brand starts with one small decision.' },
    { kind: 'action', text: 'Hands sketch a logo. Cut on the pen lift →' },
    { kind: 'scene', text: 'EXT. CITY ROOFTOP — GOLDEN HOUR' },
    { kind: 'vo', text: 'V.O.  …and the courage to show it to the world.' },
  ];
  storyboard = [
    { shot: 'WIDE', note: 'Establishing · 3s', tone: 'flare' },
    { shot: 'CLOSE', note: 'Hands sketch · 2s', tone: 'teal' },
    { shot: 'TRACK', note: 'Walk to roof · 4s', tone: 'violet' },
    { shot: 'REVEAL', note: 'Logo sting · 2s', tone: 'amber' },
  ];
  planning = ['Brief & goals', 'Audience & tone', 'Hook in 3 seconds', 'Beat sheet', 'Voice-over draft', 'Shot list'];

  // ── Motion ────────────────────────────────

  motionChips = ['Kinetic type', 'Whip pans', 'Glitch', 'Morph cuts', 'Parallax', 'Lower thirds', 'Object tracking', 'Rotoscoping', 'Particle FX', 'Logo stings'];

  // ── Editing polish ────────────────────────────

  gradePos = signal(52);
  waveBefore = this.wave(46, 7, 0.9);
  waveAfter = this.wave(46, 3, 0.45);
  polish = [
    { icon: 'bi-palette', title: 'Colour grading', text: 'Shot matching, LUTs and skin-tone balance.' },
    { icon: 'bi-soundwave', title: 'Audio enhancement', text: 'Denoise, EQ, de-ess and loudness mastering.' },
    { icon: 'bi-arrows-collapse-vertical', title: 'Seamless transitions', text: 'Cuts that feel invisible, motion that feels earned.' },
    { icon: 'bi-stars', title: 'Effects & cleanup', text: 'Stabilise, remove, composite and retouch.' },
    { icon: 'bi-badge-cc', title: 'Captions & titles', text: 'Accurate subtitles and brand-safe typography.' },
    { icon: 'bi-patch-check', title: 'Final polish', text: 'Frame-by-frame QC before anything ships.' },
  ];

  // ── Adobe ─────────────────────────────────

  adobe: AdobeTool[] = [
    { code: 'Pr', name: 'Premiere Pro', role: 'Editing & finishing', level: 96, skills: ['Multicam', 'Proxy workflow', 'Lumetri'], tone: 'violet' },
    { code: 'Ae', name: 'After Effects', role: 'Motion graphics & VFX', level: 92, skills: ['Expressions', 'Tracking', 'Compositing'], tone: 'flare' },
    { code: 'Ps', name: 'Photoshop', role: 'Thumbnails & design', level: 88, skills: ['Retouching', 'Mattes', 'Brand assets'], tone: 'teal' },
    { code: 'Au', name: 'Audition', role: 'Audio restoration & mix', level: 90, skills: ['Noise reduction', 'Mastering', 'Voice clean-up'], tone: 'amber' },
  ];

  // ── Delivery ──────────────────────────────

  presets: ExportPreset[] = [
    { icon: 'bi-youtube', name: 'YouTube 4K', spec: 'H.264 · 3840×2160 · 24 fps', use: 'Long-form & ads' },
    { icon: 'bi-phone', name: 'Reels / Shorts', spec: 'H.264 · 1080×1920 · 30 fps', use: 'Vertical social' },
    { icon: 'bi-film', name: 'Master file', spec: 'ProRes 422 HQ · 4K', use: 'Archive & broadcast' },
    { icon: 'bi-globe2', name: 'Web hero', spec: 'H.265 / WebM · 1080p loop', use: 'Landing pages' },
  ];
  deliverables = ['Final video, all formats', 'Captions (.srt)', 'Thumbnails', 'Project file archive'];
  renderSteps = ['Rendering', 'Quality check', 'Uploading', 'Delivered'];

  // ── Lifecycle ─────────────────────────────

  ngOnInit(): void {
    forkJoin({
      videos: this.userController.getVideos().pipe(catchError(() => of(null))),
      reviews: this.userController.getReviews().pipe(catchError(() => of(null))),
    }).subscribe(({ videos, reviews }: any) => {
      const list: ApiVideo[] = Array.isArray(videos?.data) ? videos.data : [];
      const live = list.filter((v) => v.is_active === 1 && v.is_deleted === 0);
      if (live.length) {
        this.projects.set(
          live.map((v, i) => {
            const ms = v.created_at ? new Date(v.created_at.replace(' ', 'T')).getTime() : NaN;
            return {
              id: v.id,
              title: v.title,
              client: v.name,
              description: v.description,
              tags: v.category ?? [],
              views: +v.views || 0,
              year: Number.isNaN(ms) ? '' : String(new Date(ms).getFullYear()),
              createdAt: Number.isNaN(ms) ? null : ms,
              video: v.vedio_url,
              poster: v.thumbnail_url,
              tone: TONES[i % TONES.length],
            };
          }),
        );
        this.live.set(true);
      }

      const rated: { rating: number }[] = (Array.isArray(reviews?.data) ? reviews.data : []).filter(
        (r: any) => r.rating > 0 && r.is_active !== 0,
      );
      if (rated.length) this.rating.set(rated.reduce((n, r) => n + r.rating, 0) / rated.length);
      this.loaded.set(true);
    });

    this.startSteps();

    // deep links such as /work#workflow: scroll once the sections have rendered
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      if (id) setTimeout(() => this.scrollTo(id), 150);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.stepTimer);
  }

  // ── Actions ───────────────────────────────

  pickTag(tag: string): void {
    this.activeTag.set(tag);
  }

  pickStep(i: number): void {
    this.activeStep.set(i);
    this.startSteps(); // restart the auto-advance so a click isn't immediately overridden
  }

  private startSteps(): void {
    clearInterval(this.stepTimer);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.stepTimer = setInterval(
      () => this.activeStep.update((i) => (i + 1) % this.steps.length),
      4200,
    );
  }

  onGrade(event: Event): void {
    this.gradePos.set(+(event.target as HTMLInputElement).value);
  }

  formatViews = formatViews;
  hoursFormat = (v: number) => `${v} h`;

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Deterministic pseudo-waveform so SSR/tests and repeat renders match. */
  private wave(n: number, floor: number, jitter: number): number[] {
    return Array.from({ length: n }, (_, i) => {
      const envelope = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11));
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      return Math.round(floor + (Math.abs(noise) * jitter + envelope) * 38);
    });
  }
}
