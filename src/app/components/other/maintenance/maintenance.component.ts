import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cr-maint d-flex flex-column align-items-center justify-content-center text-center">
      <div class="d-flex align-items-center gap-2 mb-4">
        <span class="cr-logo-mark" aria-hidden="true">&#9654;</span>
        <span class="cr-wordmark text-body-emphasis">CUTROOM</span>
      </div>

      <span class="cr-status font-monospace text-uppercase mb-4">
        <span class="cr-dot" aria-hidden="true"></span>
        Back online at {{ backAt }}
      </span>

      <h1 class="cr-maint-title text-body-emphasis mb-3">Rendering.<br />Back shortly.</h1>

      <p class="cr-maint-copy mb-4">
        Scheduled maintenance. The showreel and portfolio return within the hour — urgent enquiries
        still reach me by email.
      </p>

      <!-- colour bars, purely decorative -->
      <div class="cr-bars mb-4" aria-hidden="true">
        @for (c of bars; track c) {
          <span [style.background]="'var(' + c + ')'"></span>
        }
      </div>

      <a class="cr-mail font-monospace" href="mailto:hello&#64;cutroom.studio">hello&#64;cutroom.studio</a>

      <p class="cr-caption font-monospace text-uppercase mt-5 mb-0">
        Maintenance · Coming soon · Status when it returns and who to reach a human
      </p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .cr-maint {
      min-height: 100vh;
      padding: 4rem 1rem;
      background-image: radial-gradient(
          50% 60% at 0% 0%,
          color-mix(in srgb, var(--cr-teal) 10%, transparent),
          transparent
        ),
        radial-gradient(50% 60% at 100% 100%, color-mix(in srgb, var(--cr-flare) 20%, transparent), transparent);
    }

    .cr-logo-mark {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      font-size: 0.7rem;
      color: #fff;
      background: var(--cr-flare);
      border-radius: 0.4rem;
    }

    .cr-wordmark {
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    .cr-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.85rem;
      font-size: 0.625rem;
      letter-spacing: 0.1em;
      color: var(--cr-text-hi);
      background: var(--cr-band);
      border: 1px solid var(--cr-border-strong);
      border-radius: 2rem;
    }

    .cr-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--cr-flare);
      animation: cr-blink 1.6s ease-in-out infinite;
    }

    .cr-maint-title {
      font-size: clamp(2.5rem, 6vw, 3.75rem);
      line-height: 1;
      letter-spacing: -0.035em;
    }

    .cr-maint-copy {
      max-width: 26rem;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .cr-bars {
      display: flex;
      width: min(320px, 85%);
      height: 26px;
      gap: 3px;

      span {
        flex: 1;
        border-radius: 3px;
      }
    }

    .cr-mail {
      padding: 0.4rem 1rem;
      font-size: 0.75rem;
      color: var(--cr-text-hi);
      text-decoration: none;
      background: var(--cr-band);
      border: 1px solid var(--cr-border);
      border-radius: 0.5rem;

      &:hover {
        border-color: var(--cr-flare);
      }

      &:focus-visible {
        outline: 2px solid var(--cr-flare);
        outline-offset: 2px;
      }
    }

    .cr-caption {
      font-size: 0.5625rem;
      letter-spacing: 0.12em;
      color: var(--cr-text-mid);
      opacity: 0.8;
    }

    @keyframes cr-blink {
      50% {
        opacity: 0.25;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cr-dot {
        animation: none;
      }
    }
  `,
})
export class MaintenanceComponent {
  readonly backAt = '09:00 IST';

  /** token names from global styles */
  readonly bars = ['--cr-flare', '--cr-teal', '--cr-violet', '--cr-amber', '--cr-flare', '--cr-teal', '--cr-violet', '--cr-border-strong'];
}