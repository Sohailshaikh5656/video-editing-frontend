import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  Subscription,
} from 'rxjs';
import { ProcessService } from '../../../services/admin/process.service';
import { SharedModule } from '../../../shared/sharedModule';

interface Process {
  id: number;
  title: string;
  description: string;
  points: string[];
  is_home_screen?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProcessForm {
  title: string;
  description: string;
  points: string[];
  is_home_screen: boolean;
}

const EMPTY_FORM = (): ProcessForm => ({
  title: '',
  description: '',
  points: [''],
  is_home_screen: false,
});

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
})
export class ProcessComponent implements OnInit, OnDestroy {
  private processService = inject(ProcessService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allProcesses = signal<Process[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  form: ProcessForm = EMPTY_FORM();
  editingId: number | null = null;
  saving = signal<boolean>(false);
  formErrors = signal<Record<string, string>>({});

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allProcesses().length / this.pageSize)),
  );

  paginatedProcesses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allProcesses().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchProcesses();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchProcesses(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchProcesses(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.processService.searchProcess(search)
      : this.processService.getProcess();

    request$.subscribe({
      next: (res: any) => {
        const list: Process[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allProcesses.set(list);

        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load process items. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // ── Search / pagination ───────────────────

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSub$.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSub$.next('');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // ── Add / Edit modal ──────────────────────

  openAddModal(): void {
    this.modalMode.set('add');
    this.form = EMPTY_FORM();
    this.editingId = null;
    this.formErrors.set({});
    this.modalOpen.set(true);
  }

  openEditModal(item: Process): void {
    this.modalMode.set('edit');
    this.form = {
      title: item.title,
      description: item.description,
      points: item.points?.length ? [...item.points] : [''],
      is_home_screen: !!item.is_home_screen,
    };
    this.editingId = item.id;
    this.formErrors.set({});
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form = EMPTY_FORM();
    this.editingId = null;
    this.formErrors.set({});
  }

  // ── Points list ────────────────────────────

  addPoint(): void {
    this.form.points.push('');
  }

  removePoint(index: number): void {
    if (this.form.points.length === 1) {
      this.form.points[0] = '';
      return;
    }
    this.form.points.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ── Validation (mirrors the backend Joi schema) ───

  private validate(): boolean {
    const errors: Record<string, string> = {};
    const f = this.form;

    if (!f.title.trim() || f.title.trim().length < 3) {
      errors['title'] = 'Title must be at least 3 characters.';
    }
    if (!f.description.trim()) {
      errors['description'] = 'Description is required.';
    }

    const cleanPoints = f.points.map((p) => p.trim()).filter(Boolean);
    if (cleanPoints.length === 0) {
      errors['points'] = 'Add at least one point.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveProcess(): void {
    if (this.saving() || !this.validate()) return;

    this.saving.set(true);

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      points: this.form.points.map((p) => p.trim()).filter(Boolean),
      is_home_screen: this.form.is_home_screen,
    };

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.processService.updateProcess(this.editingId, payload)
        : this.processService.createProcess(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchProcesses(this.searchTerm.trim());
      },
      error: (err) => {
        this.saving.set(false);
        const apiMsg = err?.error?.message;
        this.formErrors.set({
          _general: apiMsg || 'Failed to save process item. Please try again.',
        });
      },
    });
  }

  // ── Delete ─────────────────────────────────

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
  }

  cancelDelete(): void {
    this.deleteTargetId = null;
  }

  deleteProcess(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.processService.deleteProcess(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchProcesses(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.errorMsg.set('Failed to delete process item. Please try again.');
      },
    });
  }

  getPoints(points: any) {
    console.log('Check', JSON.parse(points));
    return JSON.parse(points);
  }
}
