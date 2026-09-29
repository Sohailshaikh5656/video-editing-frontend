import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SharedModule } from '../../shared/sharedModule';
import * as L from 'leaflet';
import TIMEZONES, { TimeZone } from 'timezones-list';
import { UploadFileControllerComponent } from '../admin/upload-file-controller/upload-file-controller.component';
import { UploadFileType, UploadResult } from '../../services/upload/upload.models';
import { InquiryPayload, UserContactService } from '../../services/user-contact.service';

interface Step {
  label: string;
}

interface CalendarDay {
  iso: string;
  date: number;
  weekday: string;
  disabled?: boolean;
}

interface TimeSlot {
  /** Canonical value in the studio's home zone (IST) — what gets stored/sent. */
  ist: string;
  /** Localised display for the visitor's selected timezone. */
  label: string;
  /** -1/0/1 when the localised slot lands on a different calendar day than the picked one. */
  dayShift: -1 | 0 | 1;
}

interface Channel {
  icon: 'mail' | 'whatsapp' | 'drive' | 'linkedin';
  label: string;
  value: string;
  href: string;
}

interface WorkingHour {
  day: string;
  hours: string;
  note: string;
}

interface NextStep {
  index: string;
  title: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const STEPS: Step[] = [
  { label: 'About you' },
  { label: 'The project' },
  { label: 'Timing & budget' },
];

const CALENDAR_WINDOW_DAYS = 14;

/** yyyy-mm-dd from local date parts — avoids the UTC day-shift `toISOString()` can cause. */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** A rolling window starting today, with today and every past day disabled — only future dates are pickable. */
function buildCalendarDays(count = CALENDAR_WINDOW_DAYS): CalendarDay[] {
  const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      iso: toIsoDate(d),
      date: d.getDate(),
      weekday: weekdayFmt.format(d),
      disabled: d.getTime() <= today.getTime(), // blocks past dates AND today
    };
  });
}

function calendarMonthLabel(days: CalendarDay[]): string {
  if (!days.length) return '';
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const first = monthFmt.format(new Date(`${days[0].iso}T00:00:00`));
  const last = monthFmt.format(new Date(`${days[days.length - 1].iso}T00:00:00`));
  return first === last ? first : `${first.split(' ')[0]} – ${last}`;
}

// The studio books calls in its own home zone (IST, fixed UTC+5:30 — no DST),
// then localises each slot into whatever timezone the visitor picks below.
const STUDIO_TIMEZONE = 'Asia/Kolkata';
const STUDIO_UTC_OFFSET_MINUTES = 5 * 60 + 30;
const CALL_SLOTS_IST = ['10:00', '13:30', '16:00', '17:30'];

/** The absolute instant a given IST wall-clock slot represents. */
function istSlotToUtcDate(dateIso: string, hhmm: string): Date {
  const [y, m, d] = dateIso.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - STUDIO_UTC_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
}

/** Localises one IST call slot into `timeZone`, flagging a day shift if it lands on a different calendar day there. */
function localizeCallSlot(
  dateIso: string,
  hhmm: string,
  timeZone: string,
): { label: string; dayShift: -1 | 0 | 1 } {
  const instant = istSlotToUtcDate(dateIso, hhmm);
  const timeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const localDate = dateFmt.format(instant);
  const dayShift: -1 | 0 | 1 = localDate === dateIso ? 0 : localDate < dateIso ? -1 : 1;

  return { label: timeFmt.format(instant), dayShift };
}

/** Short zone abbreviation for a timezone right now, e.g. "IST", "PST", "CET". */
function timeZoneAbbreviation(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

const CHANNELS: Channel[] = [
  { icon: 'mail', label: 'Email', value: 'hello@cutroom.studio', href: 'mailto:hello@cutroom.studio' },
  { icon: 'whatsapp', label: 'WhatsApp', value: '+91 98xxx xxxxx', href: 'https://wa.me/91' },
  { icon: 'drive', label: 'Send footage', value: 'Drive, Dropbox, WeTransfer or Frame.io', href: '#' },
  { icon: 'linkedin', label: 'LinkedIn', value: '/in/cutroom-studio', href: 'https://linkedin.com' },
];

const HOURS: WorkingHour[] = [
  { day: 'Mon – Fri', hours: '10:00 – 20:00 IST', note: '4 hrs from GMT' },
  { day: 'Saturday', hours: '10:00 – 14:00 IST', note: 'Booked calls only' },
  { day: 'Sunday', hours: 'Closed', note: 'Replies resume Monday' },
];

const NEXT_STEPS: NextStep[] = [
  { index: '01', title: 'A real reply', body: 'Not an auto-reply. Within six working hours, a person who read your brief writes back — usually with a question before a price.' },
  { index: '02', title: 'A fixed quote', body: 'One number, scoped in writing, no range. Booked calls get one on the call; footage sent cold gets one within 24 hours.' },
  { index: '03', title: 'Slot booked', body: 'A 50% deposit holds your start date on the calendar. No deposit, no queue position — it protects both sides.' },
  { index: '04', title: 'Find out', body: 'Frame.io review workspace goes live the day the edit starts, so you can watch the cut take shape instead of waiting for round one.' },
];

const FAQS: FaqItem[] = [
  { q: 'I do not have a brief or a script. Can I still get in touch?', a: 'Yes, and most people do not. Send what you have — a rough idea, a deadline, a link to something you like — and the call fills the rest. Half of the first conversation is deciding what the video is actually for.' },
  { q: 'How much footage do you need to quote accurately?', a: 'None to start. A ballpark scope and rough runtime is enough for a range; the fixed number comes once we can see the actual footage or a clear shot list.' },
  { q: 'Do you work with agencies on a white-label basis?', a: 'Yes — NDAs signed same day, and delivery can go straight to your client under your own branding with no mention of us anywhere.' },
  { q: 'What if my deadline is this week?', a: 'Say so in the brief. Rush turnaround is possible for a stated premium, and we will tell you within the hour whether the timeline is realistic before anything is booked.' },
];

const PROJECT_TYPES = ['Brand film', 'Social system', 'Short-form', 'Not sure yet'] as const;
const BUDGET_RANGES = ['$2,500 – $5,000', '$5,000 – $12,000', '$12,000+', 'Not sure — advise me'] as const;

// Some platforms' ICU data still reports these legacy IANA links instead of
// the canonical zone name used by the timezones-list package.
const TZ_ALIASES: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Rangoon': 'Asia/Yangon',
  'Asia/Macao': 'Asia/Macau',
  'Asia/Ulan_Bator': 'Asia/Ulaanbaatar',
  'Europe/Kiev': 'Europe/Kyiv',
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'America/Godthab': 'America/Nuuk',
};

/** The visitor's IANA zone (e.g. "Asia/Kolkata"), used to pre-select the timezone dropdown. */
function detectTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const resolved = TZ_ALIASES[tz] ?? tz;
    return TIMEZONES.some((t) => t.tzCode === resolved) ? resolved : '';
  } catch {
    return '';
  }
}

// Jamalpur, Ahmedabad, Gujarat
const STUDIO_LAT = 23.0180;
const STUDIO_LNG = 72.5797;

/** Rejects a target date earlier than today; empty values pass (required handles that). */
function notPastDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const picked = new Date(value);
  if (Number.isNaN(picked.getTime())) return { invalidDate: true };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SharedModule, UploadFileControllerComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) private mapEl?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(UserContactService);

  readonly eyebrow = 'Contact';
  readonly heading1 = 'Tell me about';
  readonly heading2 = 'the project.';
  readonly subheading =
    'Fill in the brief below or book a call straight into the calendar. Either way you get a real reply from me, usually within six working hours, always one business day.';
  readonly badgeLeft = '3 active projects for Q2';
  readonly badgeRight = 'Replies in ~4 hrs';

  readonly steps = STEPS;
  readonly calendarDays = buildCalendarDays();
  readonly channels = CHANNELS;
  readonly hours = HOURS;
  readonly nextSteps = NEXT_STEPS;
  readonly faqs = FAQS;
  readonly projectTypes = PROJECT_TYPES;
  readonly budgetRanges = BUDGET_RANGES;
  readonly timezones: TimeZone[] = TIMEZONES;

  readonly footageAllowedTypes: UploadFileType[] = ['image', 'video'];
  readonly footageMaxSizeMb = 15;

  readonly monthLabel = calendarMonthLabel(this.calendarDays);
  readonly zoneNote = 'Call times below adjust automatically to the timezone you pick in step 1.';
  readonly todayIso = toIsoDate(new Date());

  readonly mapTitle = 'Jamalpur, Ahmedabad';
  readonly mapSub = 'Gujarat, India — remote-first, visits by appointment';
  readonly mapLink = `https://www.openstreetmap.org/?mlat=${STUDIO_LAT}&mlon=${STUDIO_LNG}#map=14/${STUDIO_LAT}/${STUDIO_LNG}`;

  readonly currentStep = signal(0);
  readonly selectedDate = signal<string | null>(this.calendarDays.find((d) => !d.disabled)?.iso ?? null);
  readonly selectedTime = signal<string | null>(CALL_SLOTS_IST[1]);
  readonly openFaq = signal<number>(-1);

  // brief-form submission state
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly footageUpload = signal<UploadResult | null>(null);

  // calendar-booking state — kept separate from the brief form above so
  // booking a call never hides the (still unsent) brief form
  readonly callSubmitting = signal(false);
  readonly callConfirmed = signal(false);

  readonly progressPct = computed(() => ((this.currentStep() + 1) / this.steps.length) * 100);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  readonly briefForm = this.fb.nonNullable.group({
    aboutYou: this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company: ['', Validators.required],
      location: [detectTimeZone(), Validators.required],
    }),
    project: this.fb.nonNullable.group({
      projectType: [PROJECT_TYPES[0] as string, Validators.required],
      brief: ['', [Validators.required, Validators.minLength(20)]],
    }),
    timingBudget: this.fb.nonNullable.group({
      budgetRange: [BUDGET_RANGES[0] as string, Validators.required],
      targetDate: ['', [Validators.required, notPastDateValidator]],
      footageUrl: ['', Validators.required],
    }),
    sendRateCard: [true],
  });

  get aboutYou(): FormGroup {
    return this.briefForm.controls.aboutYou;
  }

  get project(): FormGroup {
    return this.briefForm.controls.project;
  }

  get timingBudget(): FormGroup {
    return this.briefForm.controls.timingBudget;
  }

  private get stepGroups(): FormGroup[] {
    return [this.aboutYou, this.project, this.timingBudget];
  }

  /** Tracks the timezone dropdown reactively so the call slots below re-localise as it changes. */
  private readonly locationTz = toSignal(this.aboutYou.controls['location'].valueChanges, {
    initialValue: this.aboutYou.controls['location'].value as string,
  });

  /** The 4 studio call slots, localised to whatever timezone is currently selected + the picked calendar day. */
  readonly timeSlots = computed<TimeSlot[]>(() => {
    const day = this.selectedDate() ?? this.todayIso;
    const tz = this.locationTz() || STUDIO_TIMEZONE;
    return CALL_SLOTS_IST.map((ist) => {
      const { label, dayShift } = localizeCallSlot(day, ist, tz);
      return { ist, label, dayShift };
    });
  });

  readonly timezoneAbbrev = computed(() => timeZoneAbbreviation(this.locationTz() || STUDIO_TIMEZONE));

  readonly selectedSlotLabel = computed(
    () => this.timeSlots().find((s) => s.ist === this.selectedTime())?.label ?? '',
  );

  private map?: L.Map;

  ngAfterViewInit() {
    // slight delay so the container has real layout dimensions before Leaflet measures it
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initMap() {
    if (!this.mapEl || this.map) return;

    this.map = L.map(this.mapEl.nativeElement, {
      center: [STUDIO_LAT, STUDIO_LNG],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const pulseIcon = L.divIcon({
      className: 'cr-leaflet-pin',
      html: `
        <span class="cr-pin-ring"></span>
        <span class="cr-pin-ring cr-pin-ring-delay"></span>
        <span class="cr-pin-dot"></span>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([STUDIO_LAT, STUDIO_LNG], { icon: pulseIcon })
      .addTo(this.map)
      .bindPopup('<strong>Jamalpur, Ahmedabad</strong><br />Gujarat, India');

    // Leaflet sometimes measures a 0-width container on first paint inside flex/grid layouts
    setTimeout(() => this.map?.invalidateSize(), 150);
  }

  goToStep(i: number) {
    if (i <= this.currentStep()) this.currentStep.set(i);
  }

  next() {
    const group = this.stepGroups[this.currentStep()];
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    if (!this.isLastStep()) this.currentStep.update((v) => v + 1);
  }

  back() {
    if (this.currentStep() > 0) this.currentStep.update((v) => v - 1);
  }

  setProjectType(type: string) {
    this.project.get('projectType')?.setValue(type);
  }

  onFootageUploaded(result: UploadResult | null): void {
    this.footageUpload.set(result);
    const control = this.timingBudget.get('footageUrl');
    control?.setValue(result?.url ?? '');
    control?.markAsTouched();
  }

  submitBrief() {
    if (this.briefForm.invalid) {
      this.briefForm.markAllAsTouched();
      const firstInvalid = this.stepGroups.findIndex((g) => g.invalid);
      if (firstInvalid !== -1) this.currentStep.set(firstInvalid);
      return;
    }

    const { aboutYou, project, timingBudget } = this.briefForm.getRawValue();
    const bookingDate = this.selectedDate() ?? this.todayIso;
    const bookingTime = this.selectedTime() ?? CALL_SLOTS_IST[0];

    const payload: InquiryPayload = {
      full_name: aboutYou.fullName,
      email: aboutYou.email,
      company: aboutYou.company,
      timezone: aboutYou.location,
      project_type: project.projectType,
      brief: project.brief,
      budget: timingBudget.budgetRange,
      target_date: timingBudget.targetDate,
      footage_url: timingBudget.footageUrl,
      booking_time: istSlotToUtcDate(bookingDate, bookingTime).toISOString(),
    };

    this.submitting.set(true);
    this.submitError.set(null);

    this.contactService.createInquiry(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('Something went wrong sending your brief. Please try again.');
      },
    });
  }

  sendAnother() {
    this.briefForm.reset({
      aboutYou: { fullName: '', email: '', company: '', location: detectTimeZone() },
      project: { projectType: PROJECT_TYPES[0], brief: '' },
      timingBudget: { budgetRange: BUDGET_RANGES[0], targetDate: '', footageUrl: '' },
      sendRateCard: true,
    });
    this.footageUpload.set(null);
    this.currentStep.set(0);
    this.submitted.set(false);
    this.submitError.set(null);
  }

  isInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  errorMessage(control: AbstractControl | null, label = 'This field'): string {
    const errors = control?.errors;
    if (!errors) return '';
    if (errors['required']) return `${label} is required.`;
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return `Add a little more detail (min ${errors['minlength'].requiredLength} characters).`;
    if (errors['pastDate']) return 'Pick a date that is today or later.';
    if (errors['invalidDate']) return 'That date does not look valid.';
    return `${label} looks invalid.`;
  }

  pickDay(day: CalendarDay) {
    if (day.disabled) return;
    this.selectedDate.set(day.iso);
  }

  pickTime(slot: TimeSlot) {
    this.selectedTime.set(slot.ist);
  }

  confirmSlot() {
    if (!this.selectedDate() || !this.selectedTime() || this.callSubmitting() || this.callConfirmed()) return;
    this.callSubmitting.set(true);
    setTimeout(() => {
      this.callSubmitting.set(false);
      this.callConfirmed.set(true);
    }, 900);
  }

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? -1 : i);
  }

  trackDay = (_: number, d: CalendarDay) => d.iso;
  trackSlot = (_: number, s: TimeSlot) => s.ist;
  trackChannel = (_: number, c: Channel) => c.label;
  trackHour = (_: number, h: WorkingHour) => h.day;
  trackStep = (_: number, s: NextStep | Step) => (s as NextStep).index ?? (s as Step).label;
}
