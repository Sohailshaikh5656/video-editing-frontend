import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Shared right-side sliding panel used by every admin "add / edit" form,
 * replacing the old centered modal. Covers 80% of the viewport width so long
 * forms (uploads, rich fields) get real room to breathe.
 *
 * Usage:
 *   <app-drawer [open]="modalOpen()" [title]="..." (closed)="closeModal()">
 *     <div drawerBody>...fields...</div>
 *     <ng-container drawerActions>
 *       <button ...>Cancel</button>
 *       <button ...>Save</button>
 *     </ng-container>
 *   </app-drawer>
 */
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
