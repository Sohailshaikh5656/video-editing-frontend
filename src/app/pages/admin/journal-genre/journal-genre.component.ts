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
import { JournalGenreService } from '../../../services/admin/journal-genre.service';
import { SharedModule } from '../../../shared/sharedModule';

interface JournalGenre {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-journal-genre',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './journal-genre.component.html',
  styleUrl: './journal-genre.component.scss',
})
export class JournalGenreComponent implements OnInit, OnDestroy {
  private genreService = inject(JournalGenreService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allGenres = signal<JournalGenre[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  formName = '';
  editingId: number | null = null;
  saving = signal<boolean>(false);
  formError = signal<string | null>(null);

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allGenres().length / this.pageSize)),
  );

  paginatedGenres = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allGenres().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchGenres();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchGenres(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchGenres(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.genreService.searchJournalGenre(search)
      : this.genreService.getJournalGenre();

    request$.subscribe({
      next: (res: any) => {
        const list: JournalGenre[] = Array.isArray(res)
          ? res
          : (res?.data ?? []);
        this.allGenres.set(list);

        // e.g. after deleting the last item on the last page
        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load categories. Please try again.');
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
    this.formName = '';
    this.editingId = null;
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(genre: JournalGenre): void {
    this.modalMode.set('edit');
    this.formName = genre.name;
    this.editingId = genre.id;
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.formName = '';
    this.editingId = null;
    this.formError.set(null);
  }

  saveGenre(): void {
    const name = this.formName.trim();
    if (!name || this.saving()) return;

    this.saving.set(true);
    this.formError.set(null);

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.genreService.updateJournalGenre(this.editingId, { name })
        : this.genreService.createJournalGenre({ name });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchGenres(this.searchTerm.trim());
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save category. Please try again.');
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

  deleteGenre(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.genreService.deleteJournalGenre(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchGenres(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.errorMsg.set('Failed to delete category. Please try again.');
      },
    });
  }
}
