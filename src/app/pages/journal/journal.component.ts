import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

export type JournalCategory = 'Craft' | 'Workflow' | 'Business' | 'Gear';
export type JournalFilter = 'All' | JournalCategory;

export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  readMins: number;
  date: string; // display string
  /** two hex colours for the thumbnail gradient */
  tone: [string, string];
  featured?: boolean;
  author?: { name: string; initials: string };
}

export interface EarlierPost {
  slug: string;
  title: string;
  category: JournalCategory;
  readMins: number;
  date: string;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalComponent {
  readonly filters: JournalFilter[] = ['All', 'Craft', 'Workflow', 'Business', 'Gear'];
  readonly activeFilter = signal<JournalFilter>('All');

  /* ───────────── data (swap for API later) ───────────── */

  private readonly posts: JournalPost[] = [
    {
      slug: 'the-first-1-2-seconds',
      title: 'The first 1.2 seconds',
      excerpt:
        'The hook is not a sentence, it is a frame. Here is how to find one in footage you have already shot — and why the shot your crew filmed as filler is usually the answer.',
      category: 'Craft',
      readMins: 6,
      date: '12 Mar 2026',
      tone: ['#3a2a0c', '#a67c2e'],
      featured: true,
      author: { name: 'Aarav Mehta', initials: 'AM' },
    },
    {
      slug: 'proxy-workflow-4k',
      title: 'A proxy workflow that survives 4K',
      excerpt:
        'The exact Premiere and Resolve settings used here so review copies stay instant and masters stay untouched. Includes the preset file.',
      category: 'Workflow',
      readMins: 9,
      date: '04 Mar 2026',
      tone: ['#10203f', '#33558f'],
    },
    {
      slug: 'what-to-send-your-editor',
      title: 'What to send your editor',
      excerpt:
        'A one-page checklist that cuts roughly a week off most projects. Written for marketing teams, not for editors.',
      category: 'Business',
      readMins: 4,
      date: '26 Feb 2026',
      tone: ['#16241a', '#5c7a45'],
    },
    {
      slug: 'cutting-on-the-breath',
      title: 'Cutting on the breath, not the beat',
      excerpt:
        'Why matching every cut to the music makes a film feel cheaper, and what to use as a rhythm reference instead.',
      category: 'Craft',
      readMins: 7,
      date: '18 Feb 2026',
      tone: ['#0c3d3a', '#1f9d92'],
    },
    {
      slug: 'frame-io-notes',
      title: 'Frame.io notes that actually help',
      excerpt:
        'How to leave feedback an editor can act on, with four examples rewritten from vague to specific.',
      category: 'Workflow',
      readMins: 5,
      date: '09 Feb 2026',
      tone: ['#20153f', '#6a55c7'],
    },
    {
      slug: 'grade-looks-wrong-on-phones',
      title: 'Your grade looks wrong on phones',
      excerpt:
        'Everything is graded on a calibrated 27-inch display and watched on a phone at 40% brightness. Here is how to bridge that gap.',
      category: 'Craft',
      readMins: 8,
      date: '31 Jan 2026',
      tone: ['#3b1c0a', '#b5622a'],
    },
    {
      slug: 'pricing-post-production',
      title: 'Pricing post-production honestly',
      excerpt:
        'Why published prices win more work than “contact us for a quote”, with the numbers from switching to them in 2023.',
      category: 'Business',
      readMins: 11,
      date: '22 Jan 2026',
      tone: ['#3a0f14', '#a83a45'],
    },
  ];

  private readonly earlierAll: EarlierPost[] = [
    { slug: 'six-transitions', title: 'Six transitions to stop using in brand films', category: 'Craft', readMins: 6, date: '11 Jan 2026' },
    { slug: 'retainer-contract', title: 'A retainer contract that protects both sides', category: 'Business', readMins: 12, date: '02 Jan 2026' },
    { slug: 'dialogue-clean-up', title: 'Dialogue clean-up before you reach for a plugin', category: 'Craft', readMins: 7, date: '19 Dec 2025' },
    { slug: 'storage-plan', title: 'Storage that will not lose your client footage', category: 'Gear', readMins: 8, date: '08 Dec 2025' },
    { slug: 'brand-film-length', title: 'How long should a brand film actually be?', category: 'Business', readMins: 5, date: '27 Nov 2025' },
    { slug: 'reframing-16-9', title: 'Reframing 16:9 to 9:16 without ruining the shot', category: 'Workflow', readMins: 8, date: '11 Nov 2025' },
    { slug: 'nine-years', title: 'What nine years of client notes taught me', category: 'Business', readMins: 10, date: '03 Nov 2025' },
    { slug: 'monitor-calibration', title: 'Calibrating a monitor without a lab budget', category: 'Gear', readMins: 6, date: '20 Oct 2025' },
    { slug: 'mix-for-headphones', title: 'Mixing for people wearing earbuds', category: 'Craft', readMins: 7, date: '06 Oct 2025' },
  ];

  readonly topics = [
    'Colour grading',
    'Client communication',
    'Short-form strategy',
    'Pricing & contracts',
    'Hardware & storage',
    'Sound & mixing',
  ];

  /* ───────────── derived state ───────────── */

  readonly totalPosts = computed(() => this.posts.length + this.earlierAll.length);

  private readonly visiblePosts = computed(() => {
    const f = this.activeFilter();
    return f === 'All' ? this.posts : this.posts.filter((p) => p.category === f);
  });

  readonly featured = computed(() => this.visiblePosts().find((p) => p.featured) ?? null);
  readonly grid = computed(() => this.visiblePosts().filter((p) => !p.featured));

  readonly earlierLimit = signal(7);
  readonly earlier = computed(() => {
    const f = this.activeFilter();
    const list = f === 'All' ? this.earlierAll : this.earlierAll.filter((p) => p.category === f);
    return list.slice(0, this.earlierLimit());
  });
  readonly earlierTotal = computed(() => {
    const f = this.activeFilter();
    return f === 'All' ? this.earlierAll.length : this.earlierAll.filter((p) => p.category === f).length;
  });
  readonly canLoadMore = computed(() => this.earlier().length < this.earlierTotal());

  /* ───────────── newsletter ───────────── */

  readonly subscribed = signal(false);
  readonly emailError = signal(false);

  /* ───────────── actions ───────────── */

  setFilter(f: JournalFilter): void {
    this.activeFilter.set(f);
  }

  countFor(f: JournalFilter): number {
    const all = [...this.posts, ...this.earlierAll];
    return f === 'All' ? all.length : all.filter((p) => p.category === f).length;
  }

  loadMore(): void {
    this.earlierLimit.update((n) => n + 5);
  }

  gradient(p: JournalPost): string {
    return `linear-gradient(140deg, ${p.tone[0]} 25%, ${p.tone[1]})`;
  }

  subscribe(email: string): void {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    this.emailError.set(!ok);
    if (ok) {
      // TODO: call your newsletter API here
      this.subscribed.set(true);
    }
  }
}