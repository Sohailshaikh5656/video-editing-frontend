import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/sharedModule';


type Tone = 'flare' | 'teal' | 'amber' | 'violet' | 'ion' | 'moss';
type Category = 'editing' | 'short-form' | 'colour' | 'motion' | 'sound' | 'retainer';

interface Service {
  no: string;
  slug: Category;
  tone: Tone;
  title: string;
  text: string;
  video: string;
  length: string;
  tags: string[];
  points: string[];
  from: string;
  note: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, SharedModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  /* ── Filter chips ── */
  filters: { key: 'all' | Category; label: string }[] = [
    { key: 'all', label: 'All services' },
    { key: 'editing', label: 'Editing' },
    { key: 'short-form', label: 'Short-form' },
    { key: 'colour', label: 'Colour' },
    { key: 'motion', label: 'Motion & VFX' },
    { key: 'sound', label: 'Sound' },
    { key: 'retainer', label: 'Retainer' },
  ];
  active = signal<'all' | Category>('all');

  /* ── Services (video paths are placeholders — point them at your own clips) ── */
  services: Service[] = [
    {
      no: '01',
      slug: 'editing',
      tone: 'flare',
      title: 'Editing & Story',
      text: 'The core of everything. Assembly, structure, pacing and the discipline to cut what does not earn its place. Most projects live or die here, long before anyone talks about colour.',
      video: 'assets/videos/services/editing.mp4',
      length: '0:24',
      tags: ['Brand films', 'Documentary', 'YouTube', 'Ads'],
      points: [
        'Footage review & selects',
        'Paper edit / structure pass',
        'Assembly & rough cut',
        'Fine cut to picture lock',
        'Music search & sync',
        'Basic titles & lower-thirds',
        'Two review rounds',
        'Masters in every ratio',
      ],
      from: '$490',
      note: '5–10 business days',
    },
    {
      no: '02',
      slug: 'short-form',
      tone: 'teal',
      title: 'Short-Form Systems',
      text: 'Reels, Shorts and TikToks built as a repeatable template rather than one-off luck. We design the hook structure, caption rhythm and pacing once, then produce against it every month.',
      video: 'assets/videos/services/short-form.mp4',
      length: '0:18',
      tags: ['Reels', 'Shorts', 'TikTok', 'Paid social'],
      points: [
        'Hook design — first 1.2 seconds',
        'Vertical reframe from 16:9',
        'Styled auto-captions',
        'Beat-matched cutting',
        'Trend-aware pacing',
        'Thumbnail / cover frames',
        'Batch delivery 8–40 per month',
        'Performance review each month',
      ],
      from: '$140',
      note: 'per clip, 48 hrs',
    },
    {
      no: '03',
      slug: 'colour',
      tone: 'amber',
      title: 'Colour Grading',
      text: 'Resolve grades that match your brand, protect skin tones, and still look right on a phone at 40% brightness in daylight. Delivered with a reusable LUT you keep.',
      video: 'assets/videos/services/colour.mp4',
      length: '0:20',
      tags: ['Rec.709', 'LUT included', 'HDR'],
      points: [
        'Shot matching & balance',
        'Primary & secondary grade',
        'Custom show LUT (.cube)',
        'Skin-tone qualifiers',
        'Sky / product isolation',
        'Grain & halation treatment',
        'Rec.709 and HDR masters',
        'Phone & laptop verification',
      ],
      from: '$320',
      note: '2–4 business days',
    },
    {
      no: '04',
      slug: 'motion',
      tone: 'violet',
      title: 'Motion Graphics & VFX',
      text: 'Titles, lower-thirds, animated UI, clean-up and light 3D. Enough to make a product launch look like it had three shoot days when it had one.',
      video: 'assets/videos/services/motion.mp4',
      length: '0:16',
      tags: ['After Effects', 'Blender', '3D'],
      points: [
        'Kinetic typography',
        'Logo stings & end cards',
        'Screen & app UI animation',
        'Data / chart animation',
        'Object removal & clean plates',
        'Screen replacement',
        'Blender 3D product assets',
        'Source project files on request',
      ],
      from: '$380',
      note: '5–7 business days',
    },
    {
      no: '05',
      slug: 'sound',
      tone: 'ion',
      title: 'Sound Design & Mix',
      text: 'Dialogue that sits forward, music that supports instead of competing, and a final mix that passes platform loudness spec first time.',
      video: 'assets/videos/services/sound.mp4',
      length: '0:22',
      tags: ['Dialogue', 'Mix', 'Loudness spec'],
      points: [
        'Dialogue clean-up & de-noise',
        'EQ, compression, de-ess',
        'SFX & foley layering',
        'Ambience beds',
        'Music licensing guidance',
        'Loudness to −14 / −23 LUFS',
        'Stems on request',
        'Stereo delivered, 5.1 on request',
      ],
      from: '$260',
      note: '2–4 business days',
    },
    {
      no: '06',
      slug: 'retainer',
      tone: 'moss',
      title: 'Retainer / Post Partner',
      text: 'Your outsourced post department. Guaranteed weekly capacity, a dedicated channel, and a named backup editor so a sick day never becomes your problem.',
      video: 'assets/videos/services/retainer.mp4',
      length: '0:30',
      tags: ['Weekly', 'Priority', 'Team'],
      points: [
        'Guaranteed monthly capacity',
        'Dedicated Slack channel',
        'Named backup editor',
        'Shared asset & brand library',
        'Priority 48-hour queue',
        'Monthly performance review',
        'Quarterly strategy call',
        'Rolling — 30 days notice',
      ],
      from: '$3,400',
      note: 'per month, rolling',
    },
  ];

  /** rows currently shown — driven by the filter chips */
  visible = computed(() => {
    const key = this.active();
    return key === 'all' ? this.services : this.services.filter((s) => s.slug === key);
  });

  /* ── Add-ons ── */
  addons = [
    { title: 'Rush delivery', text: 'Moves you to the front of the queue. 24–48 hour turnaround.', price: '+40%' },
    { title: 'Extra revision round', text: 'Beyond the two included in every package.', price: '$90 / round' },
    { title: 'Subtitles & translation', text: 'SRT plus burned-in. 12 languages available.', price: '$45 / language' },
    { title: 'Additional aspect ratios', text: 'Reframed properly, not just centre-cropped.', price: '$35 / ratio' },
    { title: 'Thumbnail design', text: 'Three concepts, platform-sized, layered files.', price: '$60 / set' },
    { title: 'Raw footage archive', text: 'Twelve months of encrypted cold storage.', price: '$15 / month' },
    { title: 'Licensed music track', text: 'Sourced, cleared and invoiced at cost.', price: 'at cost + $25' },
    { title: 'Project file handover', text: 'Premiere or Resolve project, media linked.', price: '$75' },
  ];

  /* ── Included / not included / deliverables ── */
  included = [
    'Written scope and fixed quote before work starts',
    'Two review rounds, timestamped on Frame.io',
    'Masters in every ratio you need',
    'Colour and loudness to platform spec',
    'Full commercial rights on final payment',
    'NDA signed on request, no extra charge',
    'Footage purged 60 days after delivery',
  ];

  notIncluded = [
    'Filming, direction or on-site crew',
    'Scriptwriting or landing-page copy',
    'Stock footage and music licence fees',
    'Paid media buying or campaign management',
    'Unlimited revisions with no defined scope',
    'Anything I think is misleading to an audience',
  ];

  deliverables = [
    { use: 'Master', format: 'ProRes 422 HQ', spec: 'Source res / fps' },
    { use: 'Web', format: 'H.264 MP4', spec: '1080p / 12 Mbps' },
    { use: 'Social 9:16', format: 'H.264 MP4', spec: '1080×1920' },
    { use: 'Social 1:1', format: 'H.264 MP4', spec: '1080×1080' },
    { use: 'Captions', format: 'SRT + burned-in', spec: 'UTF-8' },
    { use: 'Audio', format: 'Stereo + mix', spec: '−14 LUFS' },
  ];

  /* ── Sectors (should add up to 100) ── */
  sectors = [
    { name: 'D2C & retail', pct: 38 },
    { name: 'SaaS & tech', pct: 22 },
    { name: 'Health', pct: 14 },
    { name: 'Creators', pct: 12 },
    { name: 'Hospitality', pct: 8 },
    { name: 'Non-profit', pct: 6 },
  ];

  scrollTo(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}