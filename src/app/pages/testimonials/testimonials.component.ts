import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';

interface StatCard {
  value: string;
  label: string;
}

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatarInitials: string;
  avatarTone: 'flare' | 'teal' | 'amber' | 'violet';
  rating: number;
  segment: string; // 'Brand teams' | 'Founders' | ...
  tag: 'retained' | 'new' | null;
}

interface FeaturedTestimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  avatarInitials: string;
  avatarTone: 'flare' | 'teal' | 'amber' | 'violet';
  stats: { value: string; label: string }[];
  videoSrc: string;
  poster?: string;
  clip: string; // e.g. "Client review · Lumen Health"
}

interface RatingBar {
  stars: number;
  percent: number;
  count: number;
}

interface PlatformRating {
  name: string;
  score: string;
  detail: string;
}

const ALL = 'All';

const STATS: StatCard[] = [
  { value: '4.9', label: 'Avg rating' },
  { value: '96%', label: 'Repeat clients' },
  { value: '18', label: 'Countries' },
  { value: '9 yrs', label: 'Client retained' },
];

const SEGMENTS = ['All', 'Brand teams', 'Founders', 'Agencies', 'Creators', 'Retained clients'];

const FEATURED: FeaturedTestimonial = {
  quote:
    'We went from scrambling for content every week to a calendar that fills itself. Same footage budget, four times the output — and the retention numbers are not close.',
  name: 'James Okonkwo',
  role: 'Founder, Lumen Health',
  location: 'London',
  avatarInitials: 'JO',
  avatarTone: 'teal',
  stats: [
    { value: '11.4M', label: 'Views' },
    { value: '84', label: 'Cuts delivered' },
    { value: '240%', label: 'Retention lift' },
  ],
  videoSrc: 'assets/videos/lumen-health.mp4',
  clip: 'Client review · Lumen Health',
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote:
      'We sent four hours of footage and half the notes. What came back had a structure we had not thought of, and it is now the way we talk about the whole product line. The first cut was closer to final than most editors get on round three.',
    name: 'Maya Reinhart',
    role: 'Head of Brand, Northwind Coffee',
    company: 'Northwind Coffee',
    location: '',
    avatarInitials: 'MR',
    avatarTone: 'flare',
    rating: 5,
    segment: 'Brand teams',
    tag: 'retained',
  },
  {
    id: 't2',
    quote:
      'As a GDP I am protective of footage and I have opinions about grades. This is the only editor I have sent a cord to without a conversation about the look first, because I already know where it will land.',
    name: 'Lena Voss',
    role: 'Creative Director, KiteGCo',
    company: 'KiteGCo',
    location: '',
    avatarInitials: 'LV',
    avatarTone: 'teal',
    rating: 5,
    segment: 'Agencies',
    tag: null,
  },
  {
    id: 't3',
    quote:
      'Honest review: the first round on our second project was not right, and I said so. It was easy — no defensiveness and no invoice for the extra round. That is why we are still here on project eleven.',
    name: 'Elena Flow',
    role: 'Producer, Meridian Agency',
    company: 'Meridian Agency',
    location: '',
    avatarInitials: 'EF',
    avatarTone: 'amber',
    rating: 5,
    segment: 'Agencies',
    tag: 'retained',
  },
  {
    id: 't4',
    quote:
      'Sofia Castellano wrangled our chairman into a chair he hates and still got him talking like a person on camera. Genuinely the easiest post partner we have worked with, and we have worked with five.',
    name: 'Sofia Castellano',
    role: 'Creative Director, Orbit Studio',
    company: 'Orbit Studio',
    location: '',
    avatarInitials: 'SC',
    avatarTone: 'violet',
    rating: 5,
    segment: 'Studios',
    tag: null,
  },
  {
    id: 't5',
    quote:
      'Forty hours of interview into twelve minutes that our chairman actually cried at. We use that clip in investor pitches now and no changes were made — that is more than the last money we spent last quarter.',
    name: 'Thomas Brennan',
    role: 'Comms Director, Sage & Oak',
    company: 'Sage & Oak',
    location: '',
    avatarInitials: 'TB',
    avatarTone: 'flare',
    rating: 5,
    segment: 'Founders',
    tag: null,
  },
  {
    id: 't6',
    quote:
      'Our legal team approved the contract without a single amendment, which has never happened before. NDAs signed same day, if you are pricing this for a large company, that part is handled.',
    name: 'Jonas Weiler',
    role: 'GC, Verta',
    company: 'Verta',
    location: '',
    avatarInitials: 'JW',
    avatarTone: 'teal',
    rating: 5,
    segment: 'Agencies',
    tag: null,
  },
  {
    id: 't7',
    quote:
      'Eleven onboarding explainers in three weeks, all consistent, all on brand. What I appreciated most was being told when an idea of mine would not work — with a better alternative attached.',
    name: 'Daniel Price',
    role: 'Marketing Lead, Hyperloop',
    company: 'Hyperloop',
    location: '',
    avatarInitials: 'DP',
    avatarTone: 'amber',
    rating: 5,
    segment: 'Founders',
    tag: null,
  },
  {
    id: 't8',
    quote:
      'Working across a five-app gym with patchy connectivity in the field, it still landed on time. Proves well up so our team could revise on mobile sites. Small thing, enormous difference.',
    name: 'Nadia Khoury',
    role: 'Head of Content, Terra Trail',
    company: 'Terra Trail',
    location: '',
    avatarInitials: 'NK',
    avatarTone: 'violet',
    rating: 5,
    segment: 'Creators',
    tag: null,
  },
  {
    id: 't9',
    quote:
      'Local rates, international standard. We compared quotes from three cities and the work here was simply better at a comparable price. The difference is the thinking, not the software.',
    name: 'Priya Sharma',
    role: 'Marketing Manager, Bangalore',
    company: 'SageOak',
    location: '',
    avatarInitials: 'PS',
    avatarTone: 'flare',
    rating: 5,
    segment: 'Brand teams',
    tag: null,
  },
  {
    id: 't10',
    quote:
      'The rooftop campaign ran across six markets and looked like one thing in all of them. Aside built the whole LUT out our in-house team could match it in phone footage. That single file saved us a quarter.',
    name: 'Aisha Rahman',
    role: 'Family, Northwind Coffee',
    company: 'Northwind Coffee',
    location: '',
    avatarInitials: 'AR',
    avatarTone: 'teal',
    rating: 5,
    segment: 'Retained clients',
    tag: 'retained',
  },
  {
    id: 't11',
    quote:
      'I have burned through two editors. This is the first one who understood that my audience notices pacing, not effects. Watch time up 30% on the same content plan. I am not looking again.',
    name: 'Ryan Mitchel',
    role: 'Creator, YouTube',
    company: 'Independent',
    location: '',
    avatarInitials: 'RM',
    avatarTone: 'amber',
    rating: 5,
    segment: 'Creators',
    tag: null,
  },
  {
    id: 't12',
    quote:
      'Twelve reels a month, delivered every Tuesday for fourteen months straight. Reliability is boring and it is exactly what I have never had to chase.',
    name: 'Chris Obi',
    role: 'Head of Social, Retained client',
    company: 'Retained client',
    location: '',
    avatarInitials: 'CO',
    avatarTone: 'violet',
    rating: 5,
    segment: 'Retained clients',
    tag: 'retained',
  },
];

const RATING_BREAKDOWN: RatingBar[] = [
  { stars: 5, percent: 92, count: 128 },
  { stars: 4, percent: 6, count: 9 },
  { stars: 3, percent: 1, count: 1 },
  { stars: 2, percent: 0.5, count: 0 },
  { stars: 1, percent: 0.5, count: 0 },
];

const PLATFORMS: PlatformRating[] = [
  { name: 'Clutch', score: '4.9', detail: '32 verified reviews' },
  { name: 'Google', score: '5.0', detail: '21 reviews' },
  { name: 'Upwork', score: '100%', detail: 'Job success, top-rated plus' },
  { name: 'LinkedIn', score: '', detail: '14 written recommendations' },
];

const LOGOS = ['NORTHWIND', 'Kite&Co', 'LUMEN', 'Hyperloop', 'ORBIT', 'Verta', 'SAGEOAK', 'TERRA'];

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent {
  readonly eyebrow = 'Client reviews';
  readonly heading1 = 'Sixty-eight teams.';
  readonly heading2 = 'Four point nine.';
  readonly subheading =
    'Every review below is from a paying client, published with permission and unedited apart from length. We have not removed the critical ones.';

  readonly stats = STATS;
  readonly segments = SEGMENTS;
  readonly featured = FEATURED;
  readonly items = TESTIMONIALS;
  readonly ratingBreakdown = RATING_BREAKDOWN;
  readonly platforms = PLATFORMS;
  readonly logos = LOGOS;
  readonly ratingNote =
    'Collected after final delivery on every project since 2021. Response rate 62%. Nothing is filtered before publishing.';

  readonly filter = signal<string>(ALL);

  readonly visible = computed<Testimonial[]>(() => {
    const f = this.filter();
    return f === ALL ? this.items : this.items.filter((t) => t.segment === f);
  });

  setFilter(seg: string) {
    this.filter.set(seg);
  }

  stars(n: number) {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }

  trackSeg = (_: number, s: string) => s;
  trackItem = (_: number, t: Testimonial) => t.id;
  trackStat = (_: number, s: StatCard) => s.label;
  trackBar = (_: number, b: RatingBar) => b.stars;
  trackPlatform = (_: number, p: PlatformRating) => p.name;
  trackLogo = (_: number, l: string) => l;
}