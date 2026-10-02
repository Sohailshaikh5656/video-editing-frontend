import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import uPlot from 'uplot';

/** Maps to `--cr-<color>`; `text-hi` gives a neutral fifth series. */
export type ChartColor = 'flare' | 'teal' | 'amber' | 'violet' | 'text-hi';

export interface ChartSeries {
  label: string;
  data: (number | null)[];
  color: ChartColor;
}

/** `#rrggbb` + alpha (0-1) -> `#rrggbbaa`. The theme tokens are always 6-digit hex. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

function compact(v: number): string {
  return Math.abs(v) >= 1000
    ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
    : String(v);
}

/**
 * Thin uPlot wrapper themed from the Cutroom CSS tokens.
 *
 * - `mode="line"`: `x` is unix seconds (time axis), series render as gradient areas.
 * - `mode="bars"`: `x` is 0..n-1 and `categories[i]` labels each bar.
 *
 * Rebuilds when inputs change or when `<html data-bs-theme>` flips, and
 * follows its container width via ResizeObserver.
 */
@Component({
  selector: 'app-uplot-chart',
  standalone: true,
  template: `
    @if (series.length > 1) {
      <div class="cr-chart-legend">
        @for (s of series; track s.label) {
          <span><i [style.background]="'var(--cr-' + s.color + ')'"></i>{{ s.label }}</span>
        }
      </div>
    }
    <div #host class="cr-chart-host"></div>
  `,
  // uPlot's own stylesheet is bundled here so charts work without any angular.json entry
  styleUrls: ['../../../../../node_modules/uplot/dist/uPlot.min.css', './uplot-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UplotChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) x: number[] = [];
  @Input({ required: true }) series: ChartSeries[] = [];
  @Input() mode: 'line' | 'bars' = 'line';
  @Input() categories: string[] | null = null;
  @Input() height = 260;
  /** line mode only: false treats `x` as plain numbers (e.g. day 1..14) instead of unix seconds */
  @Input() timeAxis = true;
  /** tooltip title for a numeric x value (line mode with `timeAxis=false`) */
  @Input() xFormat: (x: number) => string = (x) => String(x);
  /** fixed top of the y scale (e.g. 100 for percentages); defaults to data max + headroom */
  @Input() yMax: number | null = null;
  @Input() valueFormat: (v: number) => string = (v) => v.toLocaleString();

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private chart: uPlot | null = null;
  private ready = false;
  private resizeObserver?: ResizeObserver;
  private themeObserver?: MutationObserver;
  private lastWidth = 0;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.ready = true;
    this.build();

    // uPlot manages its own DOM/canvas — keep its listeners out of change detection.
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        const width = this.host.nativeElement.clientWidth;
        if (this.chart && width > 0 && width !== this.lastWidth) {
          this.lastWidth = width;
          this.chart.setSize({ width, height: this.height });
        }
      });
      this.resizeObserver.observe(this.host.nativeElement);

      this.themeObserver = new MutationObserver(() => this.build());
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-bs-theme'],
      });
    });
  }

  ngOnChanges(): void {
    if (this.ready) this.build();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.chart?.destroy();
  }

  private build(): void {
    this.chart?.destroy();
    this.chart = null;
    if (!this.x.length || !this.series.length) return;

    const css = getComputedStyle(document.documentElement);
    const token = (name: string) => css.getPropertyValue(name).trim();
    const textColor = token('--cr-text-mid');
    const gridColor = token('--cr-border');
    const surface = token('--cr-surface');
    const bars = this.mode === 'bars';
    const cats = this.categories;
    const width = this.host.nativeElement.clientWidth || 320;
    this.lastWidth = width;
    const font = '11px Inter, system-ui, sans-serif';

    const seriesOpts: uPlot.Series[] = [
      {},
      ...this.series.map((s): uPlot.Series => {
        const color = token(`--cr-${s.color}`);
        const fill = (u: uPlot) => {
          const g = u.ctx.createLinearGradient(0, u.bbox.top, 0, u.bbox.top + u.bbox.height);
          g.addColorStop(0, withAlpha(color, bars ? 0.95 : 0.35));
          g.addColorStop(1, withAlpha(color, bars ? 0.45 : 0.02));
          return g;
        };
        return bars
          ? {
              label: s.label,
              stroke: color,
              width: 0,
              fill,
              paths: uPlot.paths.bars!({ size: [0.55, 56], radius: 0.25 }),
              points: { show: false },
            }
          : {
              label: s.label,
              stroke: color,
              width: 2,
              fill,
              spanGaps: true,
              paths: uPlot.paths.spline!(),
              points: { show: true, size: 6, width: 2, fill: surface, stroke: color },
            };
      }),
    ];

    const opts: uPlot.Options = {
      width,
      height: this.height,
      padding: [12, 8, 0, 0],
      legend: { show: false },
      cursor: bars
        ? { x: false, y: false, drag: { x: false, y: false }, points: { show: false } }
        : { y: false, drag: { x: false, y: false }, points: { size: 9, width: 2 } },
      scales: {
        x: bars
          ? { time: false, range: (_u, min, max) => [min - 0.6, max + 0.6] }
          : { time: this.timeAxis },
        y: { range: (_u, _min, max) => [0, this.yMax ?? Math.max(max * 1.15, 4)] },
      },
      axes: [
        {
          stroke: textColor,
          font,
          grid: { show: false },
          ticks: { show: false },
          ...(bars && cats
            ? {
                incrs: [1],
                space: 40,
                values: (_u: uPlot, vals: number[]) =>
                  vals.map((i) => {
                    const label = Number.isInteger(i) ? (cats[i] ?? '') : '';
                    return label.length > 11 ? `${label.slice(0, 10)}…` : label;
                  }),
              }
            : {}),
        },
        {
          stroke: textColor,
          font,
          size: 44,
          grid: { stroke: gridColor, width: 1, dash: [3, 4] },
          ticks: { show: false },
          values: (_u: uPlot, vals: number[]) =>
            vals.map((v) => (Number.isInteger(v) ? compact(v) : '')),
        },
      ],
      series: seriesOpts,
      plugins: [this.tooltipPlugin()],
    };

    const data: uPlot.AlignedData = [this.x, ...this.series.map((s) => s.data)];
    this.zone.runOutsideAngular(() => {
      this.chart = new uPlot(opts, data, this.host.nativeElement);
    });
  }

  private tooltipPlugin(): uPlot.Plugin {
    let tip: HTMLDivElement;
    const css = getComputedStyle(document.documentElement);

    return {
      hooks: {
        init: (u) => {
          tip = document.createElement('div');
          tip.className = 'cr-chart-tip';
          u.over.appendChild(tip);
        },
        setCursor: (u) => {
          const { idx, left, top } = u.cursor;
          if (idx == null || left == null || left < 0 || top == null) {
            tip.style.display = 'none';
            return;
          }

          const title = document.createElement('div');
          title.className = 'tip-title';
          const xv = u.data[0][idx] as number;
          title.textContent = this.categories
            ? (this.categories[idx] ?? '')
            : this.timeAxis
              ? new Date(xv * 1000).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
              : this.xFormat(xv);

          const rows = this.series.map((s, i) => {
            const row = document.createElement('div');
            row.className = 'tip-row';
            const dot = document.createElement('i');
            dot.style.background = css.getPropertyValue(`--cr-${s.color}`).trim();
            const label = document.createElement('span');
            label.textContent = s.label;
            const value = document.createElement('b');
            const v = u.data[i + 1][idx];
            value.textContent = v == null ? '–' : this.valueFormat(v);
            row.append(dot, label, value);
            return row;
          });

          tip.replaceChildren(title, ...rows);
          tip.style.display = 'block';

          const tipW = tip.offsetWidth;
          const flip = left + tipW + 24 > u.over.clientWidth;
          tip.style.left = `${flip ? left - tipW - 12 : left + 12}px`;
          tip.style.top = `${Math.max(0, top - 10)}px`;
        },
      },
    };
  }
}
