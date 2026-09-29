import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Drop-in loading indicator used wherever a component is waiting on an API
 * call — admin tables, admin drawers/modals, and public pages alike.
 *
 * `overlay` mode is absolutely positioned, so give the parent
 * `position: relative` when using it to cover existing content while data
 * refreshes underneath (e.g. a save-in-progress drawer).
 */
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  @Input() label = 'Loading…';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() overlay = false;
}
