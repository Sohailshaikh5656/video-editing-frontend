import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

/**
 * Fades + lifts an element into view the first time it scrolls on screen.
 * Also sets `data-in="true"` on the host so stylesheets can start their own
 * animations (progress bars, meters) at the same moment.
 *
 *   <div appReveal>…</div>
 *   <div [appReveal]="150">…</div>   // 150ms stagger delay
 */
@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') delay: number | string = 0;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      host.dataset['in'] = 'true';
      return;
    }

    host.style.opacity = '0';
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.observer?.disconnect();
        host.dataset['in'] = 'true';
        host.style.opacity = '';
        host.animate(
          [
            { opacity: 0, transform: 'translateY(26px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 700,
            delay: Number(this.delay) || 0,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'backwards',
          },
        );
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
