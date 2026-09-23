import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { SharedModule } from '../../shared/sharedModule';
import * as L from 'leaflet';

interface Step {
  label: string;
}

interface CalendarDay {
  date: number;
  weekday: string;
  disabled?: boolean;
}

interface TimeSlot {
  label: string;
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

const CALENDAR_DAYS: CalendarDay[] = [
  { date: 6, weekday: 'Mon' },
  { date: 7, weekday: 'Tue' },
  { date: 8, weekday: 'Wed', disabled: true },
  { date: 9, weekday: 'Thu' },
  { date: 10, weekday: 'Fri' },
  { date: 11, weekday: 'Sat', disabled: true },
  { date: 12, weekday: 'Sun', disabled: true },
  { date: 13, weekday: 'Mon' },
  { date: 14, weekday: 'Tue' },
  { date: 15, weekday: 'Wed' },
  { date: 16, weekday: 'Thu' },
  { date: 17, weekday: 'Fri' },
  { date: 18, weekday: 'Sat', disabled: true },
  { date: 19, weekday: 'Sun', disabled: true },
];

const TIME_SLOTS: TimeSlot[] = [
  { label: '10:00' },
  { label: '13:30' },
  { label: '16:00' },
  { label: '17:30' },
];

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

// Jamalpur, Ahmedabad, Gujarat
const STUDIO_LAT = 23.0180;
const STUDIO_LNG = 72.5797;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) private mapEl?: ElementRef<HTMLDivElement>;

  readonly eyebrow = 'Contact';
  readonly heading1 = 'Tell me about';
  readonly heading2 = 'the project.';
  readonly subheading =
    'Fill in the brief below or book a call straight into the calendar. Either way you get a real reply from me, usually within six working hours, always one business day.';
  readonly badgeLeft = '3 active projects for Q2';
  readonly badgeRight = 'Replies in ~4 hrs';

  readonly steps = STEPS;
  readonly calendarDays = CALENDAR_DAYS;
  readonly timeSlots = TIME_SLOTS;
  readonly channels = CHANNELS;
  readonly hours = HOURS;
  readonly nextSteps = NEXT_STEPS;
  readonly faqs = FAQS;

  readonly monthLabel = 'April 2026';
  readonly zoneNote = 'Times shown in your timezone. Google Meet link sent on confirmation.';

  readonly mapTitle = 'Jamalpur, Ahmedabad';
  readonly mapSub = 'Gujarat, India — remote-first, visits by appointment';
  readonly mapLink = `https://www.openstreetmap.org/?mlat=${STUDIO_LAT}&mlon=${STUDIO_LNG}#map=14/${STUDIO_LAT}/${STUDIO_LNG}`;

  readonly currentStep = signal(0);
  readonly selectedDay = signal<number | null>(9);
  readonly selectedTime = signal<string | null>('13:30');
  readonly openFaq = signal<number>(-1);
  readonly submitting = signal(false);
  readonly submitted = signal(false);

  readonly progressPct = computed(() => ((this.currentStep() + 1) / this.steps.length) * 100);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

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
    if (!this.isLastStep()) this.currentStep.update((v) => v + 1);
  }

  back() {
    if (this.currentStep() > 0) this.currentStep.update((v) => v - 1);
  }

  pickDay(day: CalendarDay) {
    if (day.disabled) return;
    this.selectedDay.set(day.date);
  }

  pickTime(slot: TimeSlot) {
    this.selectedTime.set(slot.label);
  }

  confirmSlot() {
    if (!this.selectedDay() || !this.selectedTime()) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 900);
  }

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? -1 : i);
  }

  trackDay = (_: number, d: CalendarDay) => d.date;
  trackSlot = (_: number, s: TimeSlot) => s.label;
  trackChannel = (_: number, c: Channel) => c.label;
  trackHour = (_: number, h: WorkingHour) => h.day;
  trackStep = (_: number, s: NextStep | Step) => (s as NextStep).index ?? (s as Step).label;
}