import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  index: string;
  title: string;
  items: FaqItem[];
}

interface ContactCard {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  isPrimary?: boolean;
}

const CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    index: '01',
    title: 'Getting started',
    items: [
      {
        id: 'gs-1',
        q: 'What do you need from me to get started?',
        a: 'Three things: the footage (or a link to it), a sense of what the video is for and who watches it, and a deadline. That is genuinely enough to give a quote. Everything else — reference films, brand guideline, a script if one exists — helps and speeds things up, but nothing is blocked without it.',
      },
      { id: 'gs-2', q: 'I do not have a brief or a script. Is that a problem?', a: 'No, and most enquiries arrive that way. The first call exists partly to work out what the video is actually for. If there is no script and the piece needs one, structure gets built from the footage in a paper edit before any cutting starts — that is included in editing, not billed as scriptwriting.' },
      { id: 'gs-3', q: 'How far in advance should I book?', a: 'Two to three weeks ahead for a normal slot, longer around Q4 when calendars fill fast. Rush turnaround is possible for a stated premium if the timeline is tight.' },
      { id: 'gs-4', q: 'Do you take on small or one-off projects?', a: 'Yes — the Starter package exists specifically for a single video with a clear brief and clean footage. No minimum commitment required.' },
      { id: 'gs-5', q: 'Can you work from a rough cut someone else started?', a: 'Usually yes. Send the project files and the original footage; the first call includes a quick assessment of whether it is faster to refine that cut or restart from the source.' },
      { id: 'gs-6', q: 'What kind of work do you turn down?', a: 'Anything that needs deceptive editing, misrepresents a product, or asks for footage of people used without their consent. Everything else gets a straight answer either way.' },
    ],
  },
  {
    id: 'process-revisions',
    index: '02',
    title: 'Process & revisions',
    items: [
      {
        id: 'pr-1',
        q: 'What counts as a revision round?',
        a: 'A round is one consolidated set of notes on one cut. Send them together, timestamped on Frame.io, and the whole set is addressed in one pass. Two rounds are included on Signature and one on Starter. What is not a round: fixing something that was briefed and missed — that is simply corrected, and it does not count against you.',
      },
      { id: 'pr-2', q: 'What if I do not like the first cut at all?', a: 'That is what the revision rounds are for. If the direction is genuinely wrong rather than a detail issue, say so plainly and we re-approach the structure rather than polishing something that needs rebuilding.' },
      { id: 'pr-3', q: 'How do you handle feedback from multiple stakeholders?', a: 'One consolidated document, ideally with a single owner who resolves conflicting notes before they reach the edit. Contradictory feedback sent separately slows the whole round down for everyone.' },
      { id: 'pr-4', q: 'Can we get on a call to review together?', a: 'Yes, live review calls are available on Signature and Retainer, screen-sharing the timeline directly. Useful for the first cut on a new project.' },
      { id: 'pr-5', q: 'What happens if we change direction halfway through?', a: 'A written change order covers the new scope before any extra work starts, so nothing is added to the invoice without sign-off first.' },
      { id: 'pr-6', q: 'How many people will actually work on my project?', a: 'One editor end to end on Starter and Signature, so there is no handoff between people who have not seen the raw footage. Retainer projects can add a named backup editor for coverage.' },
    ],
  },
  {
    id: 'files-delivery',
    index: '03',
    title: 'Files & delivery',
    items: [
      {
        id: 'fd-1',
        q: 'How do I send my 200GB of footage?',
        a: 'Whatever your team already uses: Google Drive, Dropbox, WeTransfer or Frame.io. For anything over about 500GB, a free Resilio Sync link gets set up, which is faster and does not need an upload window. You never pay for transfer, and there is no need to drip-share files across links.',
      },
      { id: 'fd-2', q: 'What formats do you deliver in?', a: 'MP4 (H.264) as standard for review and web delivery, ProRes on request for broadcast or archival masters, plus square, vertical and 16:9 crops as needed.' },
      { id: 'fd-3', q: 'Can I get the project files?', a: 'On Signature it is available on request, and included by default on Retainer. Starter does not include project files, but they can be added.' },
      { id: 'fd-4', q: 'How long do you keep my footage?', a: 'Raw footage and project files are kept for 90 days after final delivery, then securely deleted unless you request a longer hold or an archive handover.' },
      { id: 'fd-5', q: 'Do you provide captions and subtitles?', a: 'Styled captions and an SRT file are included on Signature and Retainer, and available as an add-on on Starter.' },
      { id: 'fd-6', q: 'Can you match an existing brand style guide?', a: 'Yes — send the guide (or a link to the deck) up front and it gets built into the project LUT, titles and motion templates from the first cut, not bolted on afterwards.' },
    ],
  },
  {
    id: 'pricing-payment',
    index: '04',
    title: 'Pricing & payment',
    items: [
      {
        id: 'pp-1',
        q: 'Which currencies and payment methods do you accept?',
        a: 'USD, EUR, GBP and INR. Wise or bank transfer for most international clients, SEPA for EUR, Faster Payments for GBP, and NEFT or UPI for Indian clients. Card payment through Stripe is available with a 2.8% processing fee added. Agencies can be invoiced on Net-30 terms against a PO.',
      },
      { id: 'pp-2', q: 'Why do you ask for a 50% deposit?', a: 'A slot in the queue is a real cost — while it is held for you, it is not available to anyone else. The deposit books that slot and is credited in full against the final invoice.' },
      { id: 'pp-3', q: 'Are there any hidden costs?', a: 'No. The six things that can move a quote — footage volume, runtime, deliverable count, turnaround, licensing, revision depth — are listed on the pricing page, and any of them get agreed in writing before they change the number.' },
      { id: 'pp-4', q: 'Do you offer a free test edit?', a: 'No, but the discovery call includes a rough scope and price range so you can see the approach before committing anything.' },
      { id: 'pp-5', q: 'Is there a discount for a long-term commitment?', a: 'Retainer clients get a lower effective per-video rate than one-off Signature projects, in exchange for a rolling monthly commitment.' },
      { id: 'pp-6', q: 'What are your invoicing and tax details like?', a: 'Invoices are GST-compliant and export-ready, with your company details, tax registration and a clear service description. Reverse-charge is available on request for eligible international clients.' },
    ],
  },
  {
    id: 'working-internationally',
    index: '05',
    title: 'Working internationally',
    items: [
      {
        id: 'wi-1',
        q: 'How do timezones actually work in practice?',
        a: 'The working day runs 10:00 to 20:00 IST, which gives four hours of live overlap with GMT and CET and roughly two with US Eastern. Notes left at the end of your day are usually answered before you start the next one. Calls with US clients are taken as late as 22:00 IST when arranged in advance.',
      },
      { id: 'wi-2', q: 'Have you worked with clients in my country before?', a: 'Likely yes across eighteen countries so far — mention where you are on the first call and a relevant past project can usually be pointed to.' },
      { id: 'wi-3', q: 'Do you speak to clients on video calls?', a: 'Yes, video calls are the default for the discovery call and any live review sessions, though a plain voice call works just as well if that is preferred.' },
      { id: 'wi-4', q: 'What language do you work in?', a: 'English for all delivery, briefs and documentation. Footage and scripts in other languages are fine — just flag it up front so subtitling and sound review are scoped correctly.' },
    ],
  },
  {
    id: 'rights-legal-security',
    index: '06',
    title: 'Rights, legal & security',
    items: [
      {
        id: 'rl-1',
        q: 'Who owns the finished video?',
        a: 'You do, in full, from the moment the final payment clears. That includes all rights in every territory and medium, in perpetuity. The only thing retained is the right to show the work in a portfolio — and even that is waived on request, at no cost, for anything confidential.',
      },
      { id: 'rl-2', q: 'Will you sign our NDA?', a: 'Yes, same day as standard, with no negotiation needed on reasonable terms.' },
      { id: 'rl-3', q: 'How is my footage stored and secured?', a: 'Encrypted at rest on a password-protected drive, access limited to the editor on your project, and deleted on the schedule described in the files section above.' },
      { id: 'rl-4', q: 'Do you carry professional insurance?', a: 'Yes, professional indemnity and public liability cover is in place and a certificate is available on request for procurement or legal review.' },
    ],
  },
];

const CONTACT_CARDS: ContactCard[] = [
  { eyebrow: 'Ask directly', title: 'Email a question', body: 'One question or twenty. No obligation and no follow-up sequence, a reply is all it is.', cta: 'hello@cutroom.studio', href: 'mailto:hello@cutroom.studio' },
  { eyebrow: 'Talk it through', title: 'Book 20 minutes', body: 'Faster than email for anything with nuance. Bring the footage link and the deadline.', cta: 'Pick a slot →', href: '#contact', isPrimary: true },
  { eyebrow: 'Read ahead', title: 'The full process', body: 'Step by step, from first call to final master, with the timings that actually apply.', cta: 'How it works →', href: '#process' },
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  readonly eyebrow = 'FAQ';
  readonly heading1 = 'Everything people ask';
  readonly heading2 = 'before saying yes.';
  readonly totalCount = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  readonly subheading = `Thirty-${this.numWord(this.totalCount)} real questions from real enquiries, answered properly. If yours is not here, ask it — and it will probably end up on this page.`;
  readonly searchPlaceholder = 'Search the FAQ — try "NDA", "revisions" or "payment"';

  readonly categories = CATEGORIES;
  readonly contactCards = CONTACT_CARDS;

  readonly query = signal('');
  readonly activeCategory = signal(CATEGORIES[0].id);
  readonly openItem = signal<string>(CATEGORIES[0].items[0].id);

  readonly filteredCategories = computed<FaqCategory[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  });

  readonly resultCount = computed(() =>
    this.filteredCategories().reduce((n, c) => n + c.items.length, 0),
  );

  setQuery(value: string) {
    this.query.set(value);
  }

  clearQuery() {
    this.query.set('');
  }

  setCategory(id: string) {
    this.activeCategory.set(id);
    document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleItem(id: string) {
    this.openItem.set(this.openItem() === id ? '' : id);
  }

  private numWord(n: number): string {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    return words[n % 10] ?? String(n % 10);
  }

  trackCat = (_: number, c: FaqCategory) => c.id;
  trackItem = (_: number, i: FaqItem) => i.id;
  trackCard = (_: number, c: ContactCard) => c.title;
}