import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface LegalDoc {
  id: string;
  label: string;
}

interface LegalSection {
  heading: string;
  body: string[];
}

@Component({
  selector: 'app-legal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container cr-legal">
      <div class="row g-5">
        <!-- sidebar -->
        <aside class="col-lg-3">
          <nav class="cr-side" aria-label="Legal documents">
            <p class="cr-eyebrow font-monospace text-uppercase mb-3">Legal</p>
            <ul class="list-unstyled d-grid gap-1 mb-4">
              @for (d of docs; track d.id) {
                <li>
                  <a
                    href="#"
                    class="cr-side-link"
                    [class.is-active]="active() === d.id"
                    [attr.aria-current]="active() === d.id ? 'page' : null"
                    (click)="select($event, d.id)"
                  >
                    {{ d.label }}
                  </a>
                </li>
              }
            </ul>

            <div class="cr-updated">
              <p class="cr-updated-label font-monospace text-uppercase mb-1">Updated</p>
              <p class="mb-0 text-body-emphasis">{{ updated }}</p>
            </div>
          </nav>
        </aside>

        <!-- content -->
        <article class="col-lg-9">
          <h1 class="text-body-emphasis mb-2">Privacy notice</h1>
          <p class="cr-lead mb-5">Plain English. No dark patterns. GDPR and UK/EU Act compliant.</p>

          @for (s of sections; track s.heading) {
            <section class="mb-5">
              <h2 class="cr-h2 text-body-emphasis mb-3">{{ s.heading }}</h2>
              @for (p of s.body; track p) {
                <p class="cr-body">{{ p }}</p>
              }
            </section>
          }
        </article>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .cr-legal {
      max-width: 1000px;
      padding-top: 3.5rem;
      padding-bottom: 5rem;
    }

    .cr-side {
      position: sticky;
      top: 1.5rem;
    }

    .cr-side-link {
      display: block;
      padding: 0.35rem 0;
      font-size: 0.8125rem;
      color: var(--cr-text-mid);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--cr-text-hi);
      }

      &.is-active {
        color: var(--cr-flare);
        font-weight: 600;
      }

      &:focus-visible {
        outline: 2px solid var(--cr-flare);
        outline-offset: 2px;
      }
    }

    .cr-updated {
      padding: 0.85rem 1rem;
      font-size: 0.8125rem;
      background: var(--cr-surface);
      border: 1px solid var(--cr-border);
      border-radius: 0.6rem;
    }

    .cr-updated-label {
      font-size: 0.5625rem;
      letter-spacing: 0.14em;
      color: var(--cr-flare);
    }

    .cr-lead {
      font-size: 1rem;
    }

    .cr-h2 {
      font-size: 1.25rem;
    }

    .cr-body {
      max-width: 42rem;
      font-size: 0.9375rem;
      line-height: 1.7;
    }

    @media (prefers-reduced-motion: reduce) {
      .cr-side-link {
        transition: none;
      }
    }
  `,
})
export class LegalComponent {
  readonly docs: LegalDoc[] = [
    { id: 'privacy', label: 'Privacy notice' },
    { id: 'terms', label: 'Terms of service' },
    { id: 'cookies', label: 'Cookie policy' },
    { id: 'licensing', label: 'Licensing & rights' },
    { id: 'accessibility', label: 'Accessibility statement' },
    { id: 'contract', label: 'Standard contract (PDF)' },
  ];

  readonly active = signal('privacy');
  readonly updated = '12 March 2026';

  readonly sections: LegalSection[] = [
    {
      heading: 'What is collected',
      body: [
        'Only what you type into the contact form: your name, email, company, and your project description. Analytics are anonymous and no individual visitor is identified or tracked across sites.',
      ],
    },
    {
      heading: 'Why it is held',
      body: [
        'To reply to your enquiry and, if we work together, to raise an invoice. Your details are held for those purposes only. Nothing is sold, shared with advertisers, or added to a mailing list without you asking for it.',
      ],
    },
    {
      heading: 'How long',
      body: [
        'Enquiries that do not turn into projects are deleted after 12 months. Project footage is purged 90 days after final delivery unless archiving is requested. Invoices are retained for 7 years as tax law requires.',
      ],
    },
  ];

  select(event: Event, id: string): void {
    event.preventDefault();
    this.active.set(id);
    // TODO: navigate with the router or load the matching document
  }
}