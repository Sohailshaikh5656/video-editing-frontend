import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface NextStep {
  label: string;
  text: string;
}

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cr-thanks d-flex flex-column align-items-center justify-content-center text-center">
      <span class="cr-check" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>

      <h1 class="cr-thanks-title text-body-emphasis mb-3">Brief received.</h1>

      <p class="cr-thanks-copy mb-5">
        Thanks {{ name }} — I have your footage link and the deadline — you will get a fixed quote
        and the timeline within 24 hours, usually much sooner.
      </p>

      <div class="container cr-steps mb-4">
        <div class="row g-3">
          @for (s of steps; track s.label) {
            <div class="col-md-4">
              <div class="cr-step h-100 text-start">
                <p class="cr-step-label font-monospace text-uppercase mb-2">{{ s.label }}</p>
                <p class="mb-0 text-body-emphasis">{{ s.text }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="d-flex flex-wrap justify-content-center gap-2">
        <a class="btn btn-outline-secondary rounded-pill px-4" routerLink="/showreel">
          <span aria-hidden="true">&#9654;</span> Watch the showreel
        </a>
        <a class="btn btn-outline-secondary rounded-pill px-4" routerLink="/process">Read the process &rarr;</a>
      </div>

      <p class="cr-caption font-monospace text-uppercase mt-5 mb-0">
        Thank you · Your session · Sets expectations, before the next thing to reach a human
      </p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .cr-thanks {
      min-height: calc(100vh - 80px);
      padding: 4rem 1rem;
      background-image: radial-gradient(
        50% 50% at 50% 0%,
        color-mix(in srgb, var(--cr-teal) 14%, transparent),
        transparent
      );
    }

    .cr-check {
      display: inline-grid;
      place-items: center;
      width: 64px;
      height: 64px;
      margin-bottom: 1.5rem;
      color: var(--cr-teal);
      border: 1px solid color-mix(in srgb, var(--cr-teal) 55%, transparent);
      border-radius: 50%;
      background: color-mix(in srgb, var(--cr-teal) 10%, transparent);
    }

    .cr-thanks-title {
      font-size: clamp(2.25rem, 5vw, 3.25rem);
      letter-spacing: -0.03em;
    }

    .cr-thanks-copy {
      max-width: 30rem;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .cr-steps {
      max-width: 760px;
    }

    .cr-step {
      padding: 1rem 1.1rem;
      font-size: 0.8125rem;
      line-height: 1.5;
      background: var(--cr-surface);
      border: 1px solid var(--cr-border);
      border-radius: 0.75rem;
    }

    .cr-step-label {
      font-size: 0.5625rem;
      letter-spacing: 0.14em;
      color: var(--cr-flare);
    }

    .cr-caption {
      font-size: 0.5625rem;
      letter-spacing: 0.12em;
      color: var(--cr-text-mid);
      opacity: 0.8;
    }
  `,
})
export class ThankYouComponent {
  private readonly route = inject(ActivatedRoute);

  /** /thank-you?name=Jane */
  readonly name = this.route.snapshot.queryParamMap.get('name') ?? 'there';

  readonly steps: NextStep[] = [
    { label: 'Next', text: 'A reply from me within 6 working hours' },
    { label: 'Then', text: 'Fixed quote + scope + contract' },
    { label: 'Meanwhile', text: 'Rate card is in your inbox' },
  ];
}