import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';

export interface Reel {
  id: string;
  index: string;
  title: string;
  client: string;
  tone: 'flare' | 'teal' | 'amber' | 'violet';
  category: string;
  role: string;
  delivery: string;
  year: string;
  length: string;
  src: string;
  poster?: string;
  captions?: string;
  note: string;
  tags: string[];
}

export interface ReelStat {
  value: string;
  label: string;
  note: string;
}

const ALL = 'All';

const DEFAULT_REELS: Reel[] = [
  {
    id: 'northbound-coffee',
    index: '01',
    title: 'The launch film that sold out a roastery in nine days.',
    client: 'Northbound Coffee',
    tone: 'flare',
    category: 'Brand film',
    role: 'Editor, Colourist, Sound',
    delivery: '2 weeks, 11 days',
    year: '2026',
    length: '01:32',
    src: 'assets/videos/northbound-coffee.mp4',
    note: 'One shoot day. Eight assets. Nine days. Single-origin launch cut from four hours of footage with no script and no shot list.',
    tags: ['Hero film', 'Colour', 'Sound design', 'Delivery'],
  },
  {
    id: 'lumen-health',
    index: '02',
    title: 'Six months of short-form, one system.',
    client: 'Lumen Health',
    tone: 'teal',
    category: 'Social system',
    role: 'Editor, Motion',
    delivery: '6 months, rolling',
    year: '2026',
    length: '00:48',
    src: 'assets/videos/lumen-health.mp4',
    note: 'A repeatable template pack so the in-house team could ship three cuts a week without a re-edit from us.',
    tags: ['Template pack', 'Motion', 'Vertical'],
  },
  {
    id: 'orbit-dynamics',
    index: '03',
    title: 'Product launch with in-house 3D.',
    client: 'Orbit Dynamics',
    tone: 'violet',
    category: 'VFX / 3D',
    role: 'Editor, VFX',
    delivery: '5 weeks',
    year: '2025',
    length: '01:10',
    src: 'assets/videos/orbit-dynamics.mp4',
    note: 'CAD files in, finished launch film out — every hero shot rendered and comped without a studio day.',
    tags: ['3D', 'Compositing', 'Grade'],
  },
  {
    id: 'meridian-labs',
    index: '04',
    title: 'Fifty-two interviews cut down to one spine.',
    client: 'Meridian Labs',
    tone: 'amber',
    category: 'Documentary',
    role: 'Story edit, Sound',
    delivery: '3 weeks',
    year: '2025',
    length: '02:04',
    src: 'assets/videos/meridian-labs.mp4',
    note: 'Found the through-line in the second interview, then built everything around it. The rest was subtraction.',
    tags: ['Story edit', 'Interview', 'Mix'],
  },
];

const DEFAULT_STATS: ReelStat[] = [
  { value: '+31%', label: 'Average launch lift', note: 'Measured against the previous release' },
  { value: '9 days', label: 'Fastest turnaround', note: 'Brief to final cut, hero film' },
  { value: '2.4M', label: 'Organic views', note: 'Across social, twelve months' },
  { value: '68%', label: 'Watched to the end', note: 'Against a 41% category benchmark' },
];

@Component({
  selector: 'app-showreel',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './showreels.component.html',
  styleUrl: './showreels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowreelComponent {
  @Input() eyebrow = 'The showreel';
  @Input() heading = 'Four cuts that made it work.';
  @Input() blurb =
    'Everything below happened inside a single quarter, with the same two-person crew and no reshoots.';

  @Input() set reels(value: Reel[]) {
    const list = value?.length ? value : DEFAULT_REELS;
    this.items.set(list);
    this.activeId.set(list[0]?.id ?? '');
    this.filter.set(ALL);
  }

  @Input() stats: ReelStat[] = DEFAULT_STATS;

  readonly items = signal<Reel[]>(DEFAULT_REELS);
  readonly filter = signal<string>(ALL);
  readonly activeId = signal<string>(DEFAULT_REELS[0].id);

  readonly categories = computed<string[]>(() => {
    const seen: string[] = [ALL];
    for (const r of this.items()) if (!seen.includes(r.category)) seen.push(r.category);
    return seen;
  });

  readonly visible = computed<Reel[]>(() => {
    const f = this.filter();
    const list = this.items();
    return f === ALL ? list : list.filter((r) => r.category === f);
  });

  readonly active = computed<Reel | undefined>(() => {
    const list = this.visible();
    return list.find((r) => r.id === this.activeId()) ?? list[0];
  });

  setFilter(name: string) {
    this.filter.set(name);
    const first = this.visible()[0];
    if (first) this.activeId.set(first.id);
  }

  select(reel: Reel) {
    this.activeId.set(reel.id);
  }

  step(direction: number) {
    const list = this.visible();
    if (!list.length) return;
    const at = list.findIndex((r) => r.id === this.active()?.id);
    const next = (at + direction + list.length) % list.length;
    this.activeId.set(list[next].id);
  }

  onRowKey(event: KeyboardEvent, reel: Reel) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.select(reel);
  }

  trackReel = (_: number, reel: Reel) => reel.id;
  trackCat = (_: number, cat: string) => cat;
  trackStat = (_: number, stat: ReelStat) => stat.label;
  trackTag = (_: number, tag: string) => tag;
}