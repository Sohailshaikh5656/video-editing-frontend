import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';

type CellType = 'check' | 'dash' | 'text';

interface Currency {
  code: string;
  label: string;
  rate: number; // relative to USD
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  usdPrice: number;
  cadence: string; // "per finished video · from" | "/mo · rolling"
  turnaround: string; // e.g. "5–10 business day turnaround"
  features: { text: string; included: boolean }[];
  cta: string;
  footnote: string;
  badge?: string;
  highlighted?: boolean;
}

interface ComparisonCell {
  type: CellType;
  text?: string;
}

interface ComparisonRow {
  feature: string;
  values: ComparisonCell[]; // one per plan, in plan order
}

interface ComparisonSection {
  label: string;
  rows: ComparisonRow[];
}

interface MoveCard {
  title: string;
  body: string;
}

interface PaymentMethod {
  abbr: string;
  label: string;
}

interface Promise {
  title: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', label: '$ USD', rate: 1 },
  { code: 'EUR', label: 'EUR', rate: 0.92 },
  { code: 'GBP', label: 'GBP', rate: 0.79 },
  { code: 'INR', label: 'INR', rate: 83 },
];

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For a single video with a clear brief and clean footage.',
    usdPrice: 490,
    cadence: 'per finished video · from',
    turnaround: '5–10 business day turnaround',
    features: [
      { text: 'Up to 3 minutes finished runtime', included: true },
      { text: 'One revision round', included: true },
      { text: 'Basic colour correction', included: true },
      { text: 'Audio clean-up & level match', included: true },
      { text: 'Titles and lower-thirds', included: true },
      { text: 'Two aspect ratios', included: true },
      { text: '5–10 business day turnaround', included: true },
      { text: 'Full grade with custom LUT', included: false },
      { text: 'Sound design & mix', included: false },
      { text: 'Motion graphics', included: false },
    ],
    cta: 'Choose Starter',
    footnote: 'Typical project: $490–$900',
  },
  {
    id: 'signature',
    name: 'Signature',
    description: 'The full post pipeline for brand films and flagship content.',
    usdPrice: 1250,
    cadence: 'per finished video · from',
    turnaround: '72-hour first cut',
    highlighted: true,
    badge: 'Most booked — 4 in Q2 projects',
    features: [
      { text: 'Up to 8 minutes finished runtime', included: true },
      { text: 'Two revision rounds', included: true },
      { text: 'Full Resolve grade + show LUT', included: true },
      { text: 'Sound design and mix to spec', included: true },
      { text: 'Motion titles & animated end card', included: true },
      { text: 'Styled captions + SRT', included: true },
      { text: 'Every aspect ratio you need', included: true },
      { text: '72-hour first cut', included: true },
      { text: 'Frame.io review workspace', included: true },
      { text: 'Project files on request', included: true },
    ],
    cta: 'Choose Signature',
    footnote: 'Typical project: $1,250–$3,200',
  },
  {
    id: 'retainer',
    name: 'Retainer',
    description: 'Ongoing capacity for teams publishing every week.',
    usdPrice: 3400,
    cadence: '/mo · rolling — 30 days notice',
    turnaround: '48-hour queue',
    features: [
      { text: 'Up to 16 finished videos per month', included: true },
      { text: 'Unlimited minor revisions', included: true },
      { text: 'Priority 48-hour queue', included: true },
      { text: 'Dedicated Slack channel', included: true },
      { text: 'Named backup editor', included: true },
      { text: 'Shared brand & asset library', included: true },
      { text: 'Monthly performance review', included: true },
      { text: 'Quarterly strategy call', included: true },
      { text: 'Everything in Signature', included: true },
      { text: 'No onboarding fee', included: true },
    ],
    cta: 'Book a call',
    footnote: 'Two retainer slots open at a time',
  },
];

const COMPARISON: ComparisonSection[] = [
  {
    label: 'Scope',
    rows: [
      { feature: 'Finished runtime included', values: [{ type: 'text', text: '3 min' }, { type: 'text', text: '8 min' }, { type: 'text', text: 'No cap' }] },
      { feature: 'Videos per month', values: [{ type: 'text', text: '1' }, { type: 'text', text: '1–3' }, { type: 'text', text: 'Up to 16' }] },
      { feature: 'Revision rounds', values: [{ type: 'text', text: '1' }, { type: 'text', text: '2' }, { type: 'text', text: 'Unlimited minor' }] },
      { feature: 'First cut turnaround', values: [{ type: 'text', text: '5–10 days' }, { type: 'text', text: '72 hours' }, { type: 'text', text: '48 hours' }] },
    ],
  },
  {
    label: 'Craft',
    rows: [
      { feature: 'Colour correction', values: [{ type: 'check' }, { type: 'check' }, { type: 'check' }] },
      { feature: 'Full grade + custom LUT', values: [{ type: 'dash' }, { type: 'check' }, { type: 'check' }] },
      { feature: 'Sound design & mix to spec', values: [{ type: 'dash' }, { type: 'check' }, { type: 'check' }] },
      { feature: 'Motion titles & end cards', values: [{ type: 'dash' }, { type: 'check' }, { type: 'check' }] },
      { feature: '3D / VFX integration', values: [{ type: 'dash' }, { type: 'text', text: 'Quoted' }, { type: 'text', text: 'Quoted' }] },
    ],
  },
  {
    label: 'Delivery',
    rows: [
      { feature: 'Aspect ratios', values: [{ type: 'text', text: '2' }, { type: 'text', text: 'All' }, { type: 'text', text: 'All' }] },
      { feature: 'Captions + SRT', values: [{ type: 'text', text: 'Add-on' }, { type: 'check' }, { type: 'check' }] },
      { feature: 'Thumbnail set', values: [{ type: 'text', text: 'Add-on' }, { type: 'text', text: 'Add-on' }, { type: 'check' }] },
      { feature: 'Project file handover', values: [{ type: 'text', text: 'Add-on' }, { type: 'text', text: 'On request' }, { type: 'check' }] },
    ],
  },
  {
    label: 'Ongoing support',
    rows: [
      { feature: 'Frame.io review workspace', values: [{ type: 'check' }, { type: 'check' }, { type: 'check' }] },
      { feature: 'Dedicated Slack channel', values: [{ type: 'dash' }, { type: 'dash' }, { type: 'check' }] },
      { feature: 'Named backup editor', values: [{ type: 'dash' }, { type: 'dash' }, { type: 'check' }] },
      { feature: 'Monthly performance review', values: [{ type: 'dash' }, { type: 'dash' }, { type: 'check' }] },
    ],
  },
];

const MOVES: MoveCard[] = [
  { title: 'Footage volume', body: 'Under 500GB is included. Beyond that, extra transcode and organising takes real hours, so it is quoted as a line item you see before anything starts.' },
  { title: 'Runtime & complexity', body: 'A 90-second film with fifteen timeline layers costs more than a 6-minute talking head. Complexity, not duration, drives most of the cost — you will always see what is driving it.' },
  { title: 'Number of deliverables', body: 'Cutdowns from a locked master are quick and cheap; ground-up different edits are not. We will tell you exactly what you are asking for before we start.' },
  { title: 'Turnaround', body: 'Standard speed is included. Rush delivery adds a stated premium up front, instead of a rushed re-quote halfway through.' },
  { title: 'Licensing', body: 'Stock footage and music are invoiced at cost with the receipt attached. We never mark those up, but will always suggest a free alternative first.' },
  { title: 'Revision depth', body: 'Two rounds cover minor notes. A change of structure after the first cut is a new scope, agreed in writing before any extra work starts.' },
];

const PAYMENTS: PaymentMethod[] = [
  { abbr: 'USD', label: 'Wire / ACH' },
  { abbr: 'EUR', label: 'SEPA transfer' },
  { abbr: 'GBP', label: 'Faster Payments' },
  { abbr: 'INR', label: 'NEFT / UPI' },
  { abbr: 'CARD', label: 'Stripe – 2.8% added' },
  { abbr: 'FX', label: 'Net-30 for agencies' },
];

const PROMISES: Promise[] = [
  { title: 'The deadline is the deadline', body: "If a cut misses the agreed date for any reason on my side, that project drops 20%. A late invoice is a mistake I'd rather eat than repeat." },
  { title: 'The quote is the invoice', body: 'No line item appears on your invoice that was not agreed in writing first. If scope changes, you approve the change before the work happens.' },
  { title: 'Walk away after the first cut', body: 'If the fit is not right and you do not want to continue, pay the 50% deposit and keep the footage organised. No argument, no invoice for the rest.' },
];

const FAQS: FaqItem[] = [
  { q: 'Why is there a deposit?', a: 'A slot in the queue is a real cost — when it is held for you, it is not available to anyone else. The 50% deposit books that slot, is credited in full against the final invoice, and is refundable up to 72 hours before the start date.' },
  { q: 'Do you do a free test edit?', a: 'No — but the discovery call includes a rough scope and price range so you can see the approach before committing anything.' },
  { q: 'What happens if the project grows halfway through?', a: 'You get a written change order for the added scope before any extra work starts. Nothing is added to the invoice without your sign-off first.' },
  { q: 'Can we pay per month instead of per project?', a: 'Yes, for Retainer clients only. Starter and Signature are billed per project: 50% deposit, balance on delivery.' },
  { q: 'Do you charge for the discovery call?', a: 'No, the first call is always free, whether or not it turns into a project.' },
];

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {
  readonly eyebrow = 'Pricing & packages';
  readonly heading = 'Published prices, because hiding them';
  readonly headingHighlight = 'wastes your time.';
  readonly subheading =
    'Every number below is a real starting price for a real scope. Custom projects get a fixed quote within 24 hours of the call — not a range, a number.';
  readonly slotsLeft = '2 slots left per Q2';
  readonly priceFootnote =
    'All prices exclude applicable taxes. Indian clients billed in INR at the equivalent tier. 50% deposit books the slot, balance on delivery.';

  readonly currencies = CURRENCIES;
  readonly plans = PLANS;
  readonly comparison = COMPARISON;
  readonly moves = MOVES;
  readonly payments = PAYMENTS;
  readonly promises = PROMISES;
  readonly faqs = FAQS;

  readonly currencyCode = signal<string>('USD');
  readonly openFaq = signal<number>(0);

  readonly currency = computed<Currency>(
    () => this.currencies.find((c) => c.code === this.currencyCode()) ?? this.currencies[0],
  );

  setCurrency(code: string) {
    this.currencyCode.set(code);
  }

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? -1 : i);
  }

  price(usd: number): string {
    const cur = this.currency();
    const value = usd * cur.rate;
    const rounded = value >= 1000 ? Math.round(value / 10) * 10 : Math.round(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur.code,
      maximumFractionDigits: 0,
    }).format(rounded);
  }

  trackByIndex = (i: number) => i;
}