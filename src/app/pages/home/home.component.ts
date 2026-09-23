import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/sharedModule';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  stats = [
    { value: '340+', label: 'Projects delivered' },
    { value: '9 yrs', label: 'In the edit suite' },
    { value: '18', label: 'Countries served' },
    { value: '72 hrs', label: 'Avg. first cut' },
  ];

  /** index of the clip currently playing, so its play button can step aside */
  work = [
    {
      color: 'flare',
      client: 'Northbound Coffee',
      year: '2024',
      length: '1:24',
      video: 'assets/videos/northbound-coffee.mp4',
      title: 'Launch film for a D2C coffee brand',
      text: 'A 90-second hero film cut three ways for site, YouTube pre-roll and paid social. Add-to-cart lifted 31% in the launch fortnight.',
      tags: ['Brand film', 'Colour', 'Sound design'],
    },
    {
      color: 'teal',
      client: 'Lumen Health',
      year: '2024',
      length: '0:38',
      video: 'assets/videos/lumen-health.mp4',
      title: 'Six months of short-form, one system',
      text: 'Built a repeatable template made of 11 cuts a month, caption-first rhythm to beat the 3-second drop, 11,400 organic saves, zero re-shoots.',
      tags: ['Short form', 'Motion GFX', 'Vertical'],
    },
    {
      color: 'violet',
      client: 'Orbit Dynamics',
      year: '2023',
      length: '2:10',
      video: 'assets/videos/orbit-dynamics.mp4',
      title: 'Product launch with in-house 3D',
      text: 'Blender assets tracked into live-action camera moves so the launch film needed one shoot day instead of three.',
      tags: ['3D', 'VFX', 'Grade'],
    },
    {
      color: 'ion',
      client: 'Meridian Labs',
      year: '2023',
      length: '12:04',
      video: 'assets/videos/meridian-labs.mp4',
      title: 'Founder documentary, 12 minutes',
      text: '40 hours of interview and b-roll reduced to a tight 12-minute film used across investor decks and the careers page.',
      tags: ['Documentary', 'Story edit', 'Sound'],
    },
  ];

  services = [
    { tag: 'Picture', color: 'flare', title: 'Editing', text: 'Story structure, pacing and cuts for brand films, ads and long-form video.' },
    { tag: 'Audio', color: 'teal', title: 'Sound', text: 'Dialogue cleanup, mixing and sound design that sits under the picture.' },
    { tag: 'Motion', color: 'violet', title: 'Motion & VFX', text: 'Titles, graphics and compositing built to match your brand.' },
  ];

  brandName = [
    { label: "NORTHWIND", logo: "" },
    { label: "Kinds&Go", logo: "" },
    { label: "LUMEN", logo: "" },
    { label: "HyperLoop", logo: "" },
    { label: "ORBIT", logo: "" },
    { label: "Verta", logo: "" },
    { label: "SAGE&OAK", logo: "" },
    { label: "NovaTech", logo: "" },
    { label: "CloudPeak", logo: "" },
    { label: "PixelWorks", logo: "" },
    { label: "Vertex", logo: "" },
    { label: "BlueStone", logo: "" },
    //Dublicate Name
    { label: "NORTHWIND", logo: "" },
    { label: "Kinds&Go", logo: "" },
    { label: "LUMEN", logo: "" },
    { label: "HyperLoop", logo: "" },
    { label: "ORBIT", logo: "" },
    { label: "Verta", logo: "" },
    { label: "SAGE&OAK", logo: "" },
    { label: "NovaTech", logo: "" },
    { label: "CloudPeak", logo: "" },
    { label: "PixelWorks", logo: "" },
    { label: "Vertex", logo: "" },
    { label: "BlueStone", logo: "" }
  ]

  tracks = [
    { name: 'V6', clips: [{ w: 3, tone: 'teal' }, { w: 3, tone: 'ion' }, { w: 1, tone: 'amber' }] },
    { name: 'V5', clips: [{ w: 3, tone: 'muted' }, { w: 2, tone: 'ion' }, { w: 2, tone: 'flare' }, { w: 1, tone: 'ion' }] },
    { name: 'V4', clips: [{ w: 1, tone: 'violet' }, { w: 1, tone: 'ion' }, { w: 1, tone: 'violet' }, { w: 2, tone: 'amber' }] },
    { name: 'V3', clips: [{ w: 2, tone: 'ion' }, { w: 2, tone: 'flare' }, { w: 2, tone: 'muted' }, { w: 1, tone: 'teal' }, { w: 2, tone: 'teal' }] },
    { name: 'V2', clips: [{ w: 3, tone: 'ion' }, { w: 2, tone: 'amber' }, { w: 3, tone: 'muted' }, { w: 2, tone: 'violet' }] },
    { name: 'V1', clips: [{ w: 3, tone: 'flare' }, { w: 2, tone: 'ion' }, { w: 3, tone: 'muted' }, { w: 1, tone: 'ion' }] },
  ];

  waveform = [24, 33, 23, 26, 47, 23, 53, 30, 51, 24, 29, 22, 72, 45, 33, 32, 73, 75, 46, 31, 26, 17, 33, 37, 26, 29, 38, 74, 34, 56, 37, 41, 27, 19, 37, 24, 31, 48, 33, 57, 43, 24, 30, 66, 17, 60, 84, 26, 19, 43, 32, 18, 65, 44, 38, 48, 64, 28];

  /* ── Why Cutroom ── */
  promises = [
    { title: 'Fixed quotes', text: 'Scope agreed before we start. The number on the quote is the number on the invoice.' },
    { title: 'Overlap hours', text: 'Guaranteed 4 hours of live overlap with EST, GMT and CET every working day.' },
    { title: 'Frame.io review', text: 'Timestamped comments. No more "around 40 seconds-ish, the bit with the logo".' },
    { title: 'You own it', text: 'Full rights on final payment, project files on request, licences in your name.' },
  ];

  /* ── Process ── */
  steps = [
    { no: '01', title: 'Call & quote', text: 'A 20-minute call to understand the goal, the audience and the deadline. You get a fixed quote and a delivery date within 24 hours.' },
    { no: '02', title: 'Footage & direction', text: 'You drop files in a shared folder. We agree on reference, tone and music before a single cut is made.' },
    { no: '03', title: 'First cut & review', text: 'A watermarked first cut lands on Frame.io. You leave timestamped notes. Two revision rounds are included as standard.' },
    { no: '04', title: 'Master & handover', text: 'Final masters in every aspect ratio you need, plus captions, thumbnails and project files on request.' },
  ];

  /* ── Colour ── */
  grade = signal(50);
  gradeNotes = [
    { title: 'Shot match', text: 'Every angle balanced to a single reference before any look is applied.' },
    { title: 'Show LUT', text: 'A reusable brand look, delivered as a .cube file you keep.' },
    { title: 'Skin protect', text: 'Qualifier-driven skin keys so faces never drift orange or green.' },
    { title: 'Phone check', text: 'Graded on a calibrated display, verified on a phone at 40% brightness.' },
  ];

  /* ── Reviews ── */
  reviews = [
    { stars: 5, quote: 'The first cut was closer to final than most editors get on round three. Aarav reads a brief properly, which sounds like a low bar until you have worked with ten people who do not.', initials: 'MR', name: 'Maya Reinhart', role: 'Head of Brand, Northwind', city: 'Berlin' },
    { stars: 5, quote: 'We went from scrambling for content every week to a calendar that fills itself. Same footage budget, four times the output, and the retention numbers speak for themselves.', initials: 'JO', name: 'James Okonkwo', role: 'Founder, Lumen Health', city: 'London' },
    { stars: 5, quote: 'Timezones were my worry and it turned out to be a non-issue. Notes left at 6pm my time were answered by the time I opened my laptop. Genuinely the easiest post partner we have had.', initials: 'SC', name: 'Sofia Castellanos', role: 'Creative Director, Orbit', city: 'Austin' },
  ];

  /* ── Pricing ── */
  plans = [
    {
      name: 'Starter', price: '$490', unit: 'per finished video', featured: false, cta: 'Choose Starter',
      points: ['Up to 3 min runtime', '1 revision round', 'Basic colour & audio', '5-day turnaround', '2 aspect ratios'],
    },
    {
      name: 'Signature', price: '$1,250', unit: 'per finished video', featured: true, badge: 'Best value', cta: 'Choose Signature',
      points: ['Up to 6 min runtime', '2 revision rounds', 'Full grade & sound mix', 'Motion titles & captions', '72-hour first cut', 'All aspect ratios'],
    },
    {
      name: 'Retainer', price: '$3,400', unit: '/mo', featured: false, cta: 'Book a call',
      points: ['Up to 16 videos / month', 'Unlimited minor revisions', 'Dedicated Slack channel', 'Named backup editor', 'Priority 48-hour queue'],
    },
  ];

  /* ── Journal ── */
  posts = [
    { tag: 'Craft', read: '6 min read', tone: 'amber', title: 'The first 1.2 seconds', text: 'Why the hook is not a headline. It is a frame — and how to find it in footage you already have.' },
    { tag: 'Workflow', read: '9 min read', tone: 'ion', title: 'A proxy workflow that survives 4K', text: 'The exact Premiere and Resolve settings we use so review copies stay fast and masters stay clean.' },
    { tag: 'Business', read: '4 min read', tone: 'teal', title: 'What to send your editor', text: 'A short checklist that cuts a week off most projects, written for marketing teams.' },
  ];

  /* ── FAQ ── */
  openFaq = signal<number | null>(0);
  faqs = [
    { q: 'How do we handle 200GB of raw footage?', a: 'Drop it into a shared Google Drive, Dropbox or Frame.io folder — whichever your team already uses. For anything over 500GB we set up a free Resilio Sync link. You never pay for transfer, and everything is deleted 60 days after final delivery unless you ask us to archive it.' },
    { q: 'What if I do not like the first cut?', a: 'Two revision rounds are included in every fixed quote. If the direction is wrong rather than the detail, we go back to the reference stage and recut at no extra cost — that is a brief problem, not your problem.' },
    { q: 'Which currencies and payment methods do you accept?', a: 'USD, GBP, EUR and INR. Bank transfer, Wise or card. Indian clients are billed in INR at the same rate. 50% deposit to book a slot, balance on final delivery.' },
    { q: 'Do you sign NDAs and work under contract?', a: 'Always. We counter-sign your NDA or send ours, and every project runs on a short scope agreement covering deliverables, dates, revisions and rights. Full rights transfer to you on final payment.' },
    { q: 'Can you match an existing brand style guide?', a: 'Yes. Send the guide, fonts and any reference edits. We build a project template with your titles, lower-thirds, safe areas and a show LUT, then reuse it on every job so the output stays consistent.' },
  ];

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }

  scrollReviews(track: HTMLElement, dir: number) {
    track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: 'smooth' });
  }

  whatWeDo = [
    {
      id: 1,
      title: "Editing & Story",
      description: "Craft compelling narratives by structuring stories, refining pacing, shaping edits, and ensuring your message resonates with every audience.",
      points: [
        "Polish raw footage",
        "Perfect edit pacing",
        "Integrate music seamlessly",
        "Strengthen brand storytelling",
        "Deliver broadcast-quality"
      ]
    },
    {
      id: 2,
      title: "Short-form System",
      description: "Engage audiences with short-form content that stands out and drives retention in fast-moving feeds, maximized for every platform.",
      points: [
        "Develop viral hooks & structure",
        "Optimize for social platforms",
        "Fast turnaround on trending content",
        "Batch creation for volume",
        "Retention-focused editing"
      ]
    },
    {
      id: 3,
      title: "Colour Grading",
      description: "Transform the raw image through nuanced grading, creating a unique look that enhances emotion and elevates production to cinematic quality.",
      points: [
        "Professional colour correction",
        "Cinematic grading styles",
        "Brand-consistent color palettes",
        "Match shots across scenes",
        "Delivery in all color spaces"
      ]
    },
    {
      id: 4,
      title: "Motion & VFX",
      description: "Add visual flair with titles, animations, and seamless compositing to bring polish, clarity, and energy to every frame.",
      points: [
        "Custom motion graphics",
        "Title & lower-third animation",
        "Logo & brand integration",
        "Visual effects & clean-up",
        "Dynamic transitions"
      ]
    },
    {
      id: 5,
      title: "Sound & Mix",
      description: "Ensure professional audio from start to finish—clean dialogue, immersive soundscapes, and pristine mixes that translate everywhere.",
      points: [
        "Dialogue cleanup",
        "Mixing for clarity & punch",
        "Sound design & effects",
        "Music selection & licensing",
        "Deliverables for all platforms"
      ]
    },
    {
      id: 6,
      title: "Retainer & Post Partner",
      description: "Ongoing, on-call post-production support as your dedicated video partner—scaling edits and strategy to your monthly content needs.",
      points: [
        "Flexible retainer packages",
        "Priority scheduling",
        "Consistent, brand-led results",
        "Workflow integration with your team",
        "Monthly reporting & reviews"
      ]
    }
  ]

}