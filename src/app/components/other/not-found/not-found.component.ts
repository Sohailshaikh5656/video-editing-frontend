import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cr-404 d-flex flex-column align-items-center justify-content-center text-center">
      <p class="cr-eyebrow font-monospace text-uppercase text-primary mb-3">Error 404</p>

      <h1 class="cr-404-title text-body-emphasis text-uppercase mb-4">
        Clip<br />not found
      </h1>

      <p class="cr-404-copy mb-4">
        This page has been cut. It happens — try the work, or head back to the start.
      </p>

      <div class="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <a class="btn btn-primary rounded-pill px-4" routerLink="/">Back to homepage</a>
        <a class="btn btn-outline-secondary rounded-pill px-4" routerLink="/work">Browse the work</a>
      </div>

      <!-- timeline strip: one clip is missing -->
      <div class="cr-timeline" role="img" aria-label="Timeline with a missing clip">
        <span class="cr-clip" style="flex: 5"></span>
        <span class="cr-clip cr-gap" style="flex: 1"></span>
        <span class="cr-clip" style="flex: 4"></span>
      </div>

      <p class="cr-caption font-monospace text-uppercase mt-4 mb-0">
        404 · 1 page not found · where the missing frame, never a dead end
      </p>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .cr-404 {
      min-height: calc(100vh - 80px);
      padding: 4rem 1rem;
      background-image: radial-gradient(
        55% 60% at 50% 0%,
        color-mix(in srgb, var(--cr-flare) 22%, transparent),
        transparent
      );
    }

    .cr-404-title {
      font-size: clamp(3.5rem, 11vw, 7rem);
      line-height: 0.92;
      letter-spacing: -0.04em;
      margin-bottom: 0;
    }

    .cr-404-copy {
      max-width: 26rem;
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
  `,
})
export class NotFoundComponent {}