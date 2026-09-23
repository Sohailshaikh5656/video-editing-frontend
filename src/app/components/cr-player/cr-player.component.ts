import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Custom video player.
 *
 *  - full mode    → seek bar, play/pause, volume, time, captions, speed, fullscreen
 *  - compact mode → muted looping preview with a single play button (for thumbnails)
 *
 * The host fills its nearest positioned parent (`position:absolute; inset:0`),
 * so drop it inside any `.ratio` box or any `position:relative` wrapper.
 */
@Component({
  selector: 'app-cr-player',
  standalone: true,
  templateUrl: './cr-player.component.html',
  styleUrl: './cr-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrPlayerComponent implements OnInit, OnDestroy {
  /** only one player plays at a time */
  private static active: CrPlayerComponent | null = null;

  @Input({ required: true }) src!: string;
  @Input() poster = '';
  /** accessible name, e.g. the project title */
  @Input() label = 'Video';
  /** shown as the total time until metadata loads, e.g. "1:24" */
  @Input() length = '';
  /** optional .vtt url — the CC button only appears when this is set */
  @Input() captions = '';
  /** muted, looping preview with no control bar */
  @Input() compact = false;
  @Input() preload: 'none' | 'metadata' | 'auto' = 'none';

  @ViewChild('video', { static: true }) private video!: ElementRef<HTMLVideoElement>;
  @ViewChild('wrap', { static: true }) private wrap!: ElementRef<HTMLElement>;
  @ViewChild('bar') private bar?: ElementRef<HTMLElement>;

  readonly playing = signal(false);
  readonly waiting = signal(false);
  readonly failed = signal(false);
  readonly idle = signal(false);
  readonly scrubbing = signal(false);
  readonly isFs = signal(false);
  readonly ccOn = signal(false);

  readonly current = signal(0);
  readonly duration = signal(0);
  readonly buffered = signal(0);
  readonly muted = signal(false);
  readonly volume = signal(1);
  readonly rate = signal(1);

  readonly pct = computed(() => (this.duration() ? (this.current() / this.duration()) * 100 : 0));
  readonly volPct = computed(() => (this.muted() ? 0 : this.volume() * 100));

  private idleTimer: ReturnType<typeof setTimeout> | undefined;

  private get media(): HTMLVideoElement {
    return this.video.nativeElement;
  }

  ngOnInit() {
    this.media.muted = this.compact;
    this.media.loop = this.compact;
    this.muted.set(this.media.muted);
    this.volume.set(this.media.volume);
  }

  ngOnDestroy() {
    clearTimeout(this.idleTimer);
    if (CrPlayerComponent.active === this) CrPlayerComponent.active = null;
  }

  /* ───────── labels ───────── */

  get curLabel(): string {
    return this.fmt(this.current());
  }

  get durLabel(): string {
    const d = this.duration();
    if (d) return this.fmt(d);
    return this.length ? this.length.split(':').map((p) => p.padStart(2, '0')).join(':') : '00:00';
  }

  private fmt(s: number): string {
    if (!isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  /* ───────── playback ───────── */

  toggle() {
    const v = this.media;
    if (v.paused) {
      v.play().catch(() => {
        /* interrupted by a pause() or a missing file — nothing to do */
      });
    } else {
      v.pause();
    }
  }

  pause() {
    this.media.pause();
  }

  seekBy(seconds: number) {
    const v = this.media;
    if (!v.duration || !isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + seconds, 0), v.duration);
    this.current.set(v.currentTime);
  }

  onPlay() {
    const prev = CrPlayerComponent.active;
    if (prev && prev !== this) prev.pause();
    CrPlayerComponent.active = this;
    this.playing.set(true);
    this.failed.set(false);
    this.wake();
  }

  onPause() {
    this.playing.set(false);
    this.waiting.set(false);
    this.idle.set(false);
    clearTimeout(this.idleTimer);
  }

  onTime() {
    if (!this.scrubbing()) this.current.set(this.media.currentTime);
  }

  onMeta() {
    const d = this.media.duration;
    if (isFinite(d)) this.duration.set(d);
  }

  onProgress() {
    const v = this.media;
    const d = v.duration;
    if (!d || !isFinite(d)) return;
    let end = 0;
    for (let i = 0; i < v.buffered.length; i++) {
      if (v.buffered.start(i) <= v.currentTime + 0.25 && v.buffered.end(i) >= v.currentTime) {
        end = v.buffered.end(i);
        break;
      }
    }
    this.buffered.set((end / d) * 100);
  }

  onVolume() {
    this.muted.set(this.media.muted);
    this.volume.set(this.media.volume);
  }

  /* ───────── seek bar ───────── */

  seekStart(e: PointerEvent) {
    if (!this.duration()) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.scrubbing.set(true);
    this.seekTo(e);
  }

  seekMove(e: PointerEvent) {
    if (this.scrubbing()) this.seekTo(e);
  }

  seekEnd(e: PointerEvent) {
    if (!this.scrubbing()) return;
    this.seekTo(e);
    this.scrubbing.set(false);
    this.wake();
  }

  private seekTo(e: PointerEvent) {
    const bar = this.bar?.nativeElement;
    const d = this.duration();
    if (!bar || !d) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    this.media.currentTime = ratio * d;
    this.current.set(ratio * d);
  }

  onSeekKey(e: KeyboardEvent) {
    const d = this.duration();
    if (!d) return;
    const step = e.shiftKey ? 10 : 5;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.seekBy(-step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.seekBy(step);
        break;
      case 'Home':
        this.seekBy(-d);
        break;
      case 'End':
        this.seekBy(d);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  /* ───────── volume / speed / captions / fullscreen ───────── */

  toggleMute() {
    const v = this.media;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.6;
  }

  setVolume(value: number) {
    const v = this.media;
    v.volume = value;
    v.muted = value === 0;
  }

  cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(this.rate()) + 1) % SPEEDS.length];
    this.media.playbackRate = next;
    this.rate.set(next);
  }

  toggleCaptions() {
    const track = this.media.textTracks[0];
    if (!track) return;
    const on = !this.ccOn();
    track.mode = on ? 'showing' : 'hidden';
    this.ccOn.set(on);
  }

  toggleFullscreen() {
    const el = this.wrap.nativeElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen();
    } else {
      // iOS Safari only supports fullscreen on the <video> itself
      (this.media as any).webkitEnterFullscreen?.();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    this.isFs.set(document.fullscreenElement === this.wrap.nativeElement);
  }

  /* ───────── auto-hiding controls ───────── */

  wake() {
    this.idle.set(false);
    clearTimeout(this.idleTimer);
    if (this.playing() && !this.compact) {
      this.idleTimer = setTimeout(() => this.idle.set(true), 2200);
    }
  }

  onLeave(e: PointerEvent) {
    if (e.pointerType === 'mouse' && this.playing() && !this.scrubbing()) this.idle.set(true);
  }

  /* ───────── keyboard (only when the player itself has focus) ───────── */

  onKey(e: KeyboardEvent) {
    if (this.compact || e.target !== e.currentTarget) return;
    switch (e.key) {
      case ' ':
      case 'k':
        this.toggle();
        break;
      case 'ArrowRight':
        this.seekBy(5);
        break;
      case 'ArrowLeft':
        this.seekBy(-5);
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'f':
        this.toggleFullscreen();
        break;
      case 'c':
        if (this.captions) this.toggleCaptions();
        break;
      default:
        return;
    }
    e.preventDefault();
    this.wake();
  }
}