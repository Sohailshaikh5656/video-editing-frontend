import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cr-maint d-flex flex-column align-items-center justify-content-center text-center">
      <p class="cr-eyebrow font-monospace text-uppercase text-primary mb-3">Scheduled maintenance</p>

      <h1 class="cr-maint-title text-body-emphasis text-uppercase mb-4">
        Back in<br />a moment
      </h1>

      <p class="cr-maint-copy mb-5">
        We're polishing the final cut. The site is temporarily unavailable while we make some
        improvements — please check back shortly.
      </p>

      <!-- timeline strip: edit in progress -->
      <div class="cr-timeline" role="img" aria-label="Timeline with a clip being edited">
        <span class="cr-clip" style="flex: 5"></span>
        <span class="cr-clip cr-pending" style="flex: 2"></span>
        <span class="cr-clip cr-gap" style="flex: 3"></span>
      </div>

      <p class="cr-caption font-monospace text-uppercase mt-4 mb-0">
        Under maintenance · thanks for your patience
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
        55% 60% at 50% 0%,
        color-mix(in srgb, var(--cr-flare) 22%, transparent),
        transparent
      );
    }

    .cr-maint-title {
      font-size: clamp(3.5rem, 11vw, 7rem);
      line-height: 0.92;
      letter-spacing: -0.04em;
      margin-bottom: 0;
    }

    .cr-maint-copy {
      max-width: 28rem;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .cr-timeline {
      display: flex;
      gap: 4px;
      width: min(360px, 90%);
      padding: 4px;
      background: var(--cr-band);
      border: 1px solid var(--cr-border);
      border-radius: 0.4rem;
    }

    .cr-clip {
      height: 10px;
      border-radius: 2px;
      background: var(--cr-flare);
    }

    .cr-pending {
      opacity: 0.5;
      animation: cr-maint-pulse 1.4s ease-in-out infinite;
    }

    .cr-gap {
      background: transparent;
      border: 1px dashed var(--cr-border-strong);
    }

    .cr-caption {
      font-size: 0.5625rem;
      letter-spacing: 0.12em;
      color: var(--cr-text-mid);
      opacity: 0.8;
    }

    @keyframes cr-maint-pulse {
      50% {
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cr-pending {
        animation: none;
      }
    }
  `,
})
export class MaintenanceComponent {}
