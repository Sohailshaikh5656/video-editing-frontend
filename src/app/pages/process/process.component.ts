import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';

interface HeadStat {
  label: string;
}

interface GanttRow {
  label: string;
  startDay: number; // 1-based
  span: number; // in days
  tone: 'flare' | 'teal' | 'amber' | 'violet';
}

interface LegendItem {
  label: string;
  tone: 'flare' | 'teal' | 'amber' | 'violet';
}

interface PhaseDeliverable {
  text: string;
}

interface Phase {
  index: string;
  dayRange: string;
  title: string;
  body: string;
  deliverables: PhaseDeliverable[];
}

interface NeedItem {
  title: string;
  body: string;
}

interface ToolCard {
  name: string;
  role: string;
  tone: 'flare' | 'teal' | 'amber' | 'violet';
  icon: 'frame' | 'slack' | 'notion' | 'drive' | 'premiere' | 'resolve';
}

interface TurnaroundRow {
  project: string;
  startTo: string;
  revisions: string;
  delivery: string;
  onTime: boolean;
}

const HEAD_STATS: HeadStat[] = [
  { label: '7–14 days typical' },
  { label: '2 revision rounds' },
  { label: '0 missed deadlines in 2025' },
];

const GANTT_ROWS: GanttRow[] = [
  { label: 'Discovery', startDay: 1, span: 1, tone: 'teal' },
  { label: 'Scope + quote', startDay: 1, span: 2, tone: 'teal' },
  { label: 'Footage intake', startDay: 2, span: 2, tone: 'amber' },
  { label: 'Paper edit', startDay: 4, span: 1, tone: 'amber' },
  { label: 'Assembly', startDay: 5, span: 2, tone: 'violet' },
  { label: 'First cut + review', startDay: 6, span: 2, tone: 'flare' },
  { label: 'Revision 1', startDay: 8, span: 1, tone: 'flare' },
  { label: 'Grade + sound', startDay: 8, span: 2, tone: 'violet' },
  { label: 'Revision 2', startDay: 9, span: 1, tone: 'flare' },
  { label: 'Masters + handover', startDay: 10, span: 1, tone: 'teal' },
];

const LEGEND: LegendItem[] = [
  { label: 'Alignment', tone: 'teal' },
  { label: 'Logistics', tone: 'amber' },
  { label: 'Draft prep', tone: 'violet' },
  { label: 'Edit & review', tone: 'flare' },
];

const PHASES: Phase[] = [
  {
    index: '01',
    dayRange: 'DAY 1 — 30 MIN',
    title: 'Discovery call',
    body: 'Twenty minutes, no pitch, no deck. We talk about what the video is for, who watches it, where it runs and what it is needed. Most of my questions are about the audience rather than the footage — a film for a landing page and a film for a conference are different films, even from identical material. If it is not a good fit, you get told on the call and not asked to overshare needlessly.',
    deliverables: [
      { text: 'Goal, audience and placement agreed' },
      { text: 'Footage volume and format confirmed' },
      { text: 'Deadline pressure tested honestly' },
      { text: 'Budget band confirmed out loud' },
      { text: "Whether it's a fit or not, said" },
    ],
  },
  {
    index: '02',
    dayRange: 'DAY 1–2 — 24 HRS',
    title: 'Scope & fixed quote',
    body: 'One number, one date, one page. Within 24 hours you get a written scope: deliverables, runtime, ratio, revision rounds, what is included and what is explicitly not. The contract is attached at the same time — not sent later once you are already committed, so nothing changes after you decide.',
    deliverables: [
      { text: 'Written scope with named deliverables' },
      { text: 'Fixed price, not a range' },
      { text: 'Delivery date committed' },
      { text: 'Standard contract attached' },
      { text: 'NDA signed if required' },
    ],
  },
  {
    index: '03',
    dayRange: 'DAY 2–3',
    title: 'Footage intake & setup',
    body: 'A shared folder and a Frame.io workspace get created. Everything is ingested, backed up twice, and providers get generated so review notes land against the real edit, not against a laggy live cut sitting on your desk. Any consent, release forms or licensed music gets flagged here — not five days into the project when it is too late.',
    deliverables: [
      { text: 'Shared folder + Frame.io workspace' },
      { text: 'Ingest, checksum, backup done' },
      { text: 'Proxy generation for faster review' },
      { text: 'Full log and selects pass' },
      { text: 'Music and reference gathered' },
    ],
  },
  {
    index: '04',
    dayRange: 'DAY 4–5',
    title: 'Paper edit & assembly',
    body: 'Structure decided before anything looks good. For anything with interview or narrative, a radio edit comes first — the story cut for audio, pictured only after. Once the top-level structure sits well and holds up, the visual pass gets layered on. Doing it this way means a structural note can be given one flow instead of a rework.',
    deliverables: [
      { text: 'Radio edit / paper cut approved' },
      { text: 'Story spine locked' },
      { text: 'Assembly against the spine' },
      { text: 'Music and pacing pass' },
      { text: 'Internal review before you see it' },
    ],
  },
  {
    index: '05',
    dayRange: 'DAY 6–8',
    title: 'First cut, review & revisions',
    body: 'Timestamped notes, consolidated rounds. The first cut lands on Frame.io, with a short walkthrough of the choices that were not obvious. You leave comments on the frame they apply to. Send all stakeholder notes together in one pass — conflicting feedback flagged, not silently resolved on your behalf.',
    deliverables: [
      { text: "Watermarked cut + a link to Frame.io" },
      { text: 'Timestamped comments on the frame' },
      { text: 'Round 1 addressed in one pass' },
      { text: 'Conflicting notes flagged, not guessed' },
      { text: 'Round 2 after picture lock' },
    ],
  },
  {
    index: '06',
    dayRange: 'DAY 9–11',
    title: 'Finish, masters & handover',
    body: 'Graded, mixed and handed over — before a phone call. Colour and sound happen after picture lock, never grading a shot that might still be cut. Every export is checked frame by frame, mix is levelled for platform loudness standards, and the whole thing is checked on a phone before anything leaves — 60% brightness before it goes anywhere.',
    deliverables: [
      { text: 'Full grade + custom LUT delivered' },
      { text: 'Mix to -14 / -23 LUFS' },
      { text: 'All ratios and captions exported' },
      { text: 'Frame and laptop verification' },
      { text: 'Files + LUT and project master saved' },
    ],
  },
];

const NEED_ITEMS: NeedItem[] = [
  { title: 'The footage', body: 'or a link to it, flat and in the correct aspect ratio.' },
  { title: 'One decision-maker', body: 'someone who can approve a cut without a rewind.' },
  { title: 'Reference', body: 'one or two films you like, even loosely, and any existing style guide.' },
  { title: 'Brand assets', body: 'logo, fonts, colours, and any existing style guide.' },
];

const TOOLS: ToolCard[] = [
  { name: 'Frame.io', role: 'Review and timestamped notes', tone: 'flare', icon: 'frame' },
  { name: 'Slack', role: 'Day-to-day questions and updates', tone: 'violet', icon: 'slack' },
  { name: 'Notion', role: 'Project scope, timeline and briefs', tone: 'teal', icon: 'notion' },
  { name: 'Drive / Dropbox', role: 'Footage transfer and delivery', tone: 'amber', icon: 'drive' },
  { name: 'Premiere Pro', role: 'The edit itself, start to finish', tone: 'violet', icon: 'premiere' },
  { name: 'DaVinci Resolve', role: 'Grading and colour finishing', tone: 'flare', icon: 'resolve' },
];

const TURNAROUNDS: TurnaroundRow[] = [
  { project: 'Short-form / reel', startTo: '24–48 hrs', revisions: '1 day', delivery: 'Same day', onTime: true },
  { project: 'Ad cutdown set', startTo: '3–5 days', revisions: '2 days', delivery: 'Same day', onTime: true },
  { project: 'Brand film (5 min)', startTo: '7–10 days', revisions: '3 days', delivery: 'Same day', onTime: true },
  { project: 'Documentary (10–20 min)', startTo: '3–5 weeks', revisions: '4–5 days', delivery: '1–2 days', onTime: true },
  { project: 'Retainer cycle (per video)', startTo: '3–4 days', revisions: '24 hrs', delivery: 'Same day', onTime: true },
];

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessComponent {
  readonly eyebrow = 'How we work';
  readonly heading1 = 'Six phases.';
  readonly heading2 = 'Nothing improvised.';
  readonly subheading =
    'The same process runs on a $490 single video and a $40k campaign. It is written down because a process you cannot describe is not a process, it is a habit.';

  readonly headStats = HEAD_STATS;
  readonly ganttRows = GANTT_ROWS;
  readonly legend = LEGEND;
  readonly totalDays = 11;
  readonly ganttCaption = 'A typical eleven-day project';
  readonly ganttTag = 'Signature package · Brand film';

  readonly phases = PHASES;
  readonly needItems = NEED_ITEMS;
  readonly tools = TOOLS;
  readonly turnarounds = TURNAROUNDS;

  readonly turnaroundNote = 'Business days, excluding time spent waiting on your feedback. Rush delivery compresses this by roughly half at +40%.';

  dayMarks = computed<number[]>(() => {
    const marks: number[] = [];
    for (let i = 1; i <= this.totalDays; i += 2) marks.push(i);
    return marks;
  });

  barStyle(row: GanttRow) {
    const left = ((row.startDay - 1) / this.totalDays) * 100;
    const width = (row.span / this.totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }

  trackByLabel = (_: number, r: GanttRow) => r.label;
  trackByIndex = (_: number, p: Phase) => p.index;
  trackByName = (_: number, t: ToolCard) => t.name;
  trackByProject = (_: number, r: TurnaroundRow) => r.project;
  trackByTitle = (_: number, n: NeedItem) => n.title;
}