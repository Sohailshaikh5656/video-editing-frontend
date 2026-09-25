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
import { JournalService } from '../../../services/admin/journal.service';
import { JournalGenreService } from '../../../services/admin/journal-genre.service';
import { SharedModule } from '../../../shared/sharedModule';
import { UploadFileControllerComponent } from '../upload-file-controller/upload-file-controller.component';
import { UploadResult } from '../../../services/upload/upload.models';

interface JournalGenre {
  id: number;
  name: string;
}

interface Journal {
  id: number;
  category_id: number;
  category_name?: string;
  time: string;
  time_type: string;
  title: string;
  description: string;
  image_url: string;
  text: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UploadFileControllerComponent,
  ],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent implements OnInit, OnDestroy {
  private journalService = inject(JournalService);
  private genreService = inject(JournalGenreService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  timeTypeOptions: string[] = ['Min', 'Hours', 'Days', 'Weeks'];

  allJournals = signal<Journal[]>([]);
  categories = signal<JournalGenre[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  saving = signal<boolean>(false);
  formError = signal<string | null>(null);
  editingId: number | null = null;

  // form fields — mirror the Joi validation schema
  formCategoryId: number | null = null;
  formTime = '';
  formTimeType = 'Min';
  formTitle = '';
  formDescription = '';
  formImageUrl = '';
  formText = '';

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allJournals().length / this.pageSize)),
  );

  paginatedJournals = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allJournals().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchJournals();
    this.fetchCategories();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchJournals(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchJournals(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.journalService.searchJournal(search)
      : this.journalService.getJournal();

    request$.subscribe({
      next: (res: any) => {
        const list: Journal[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allJournals.set(list);

        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load journals. Please try again.');
        this.loading.set(false);
      },
    });
  }

  fetchCategories(): void {
    this.genreService.getJournalGenre().subscribe({
      next: (res: any) => {
        const list: JournalGenre[] = Array.isArray(res)
          ? res
          : (res?.data ?? []);
        this.categories.set(list);
      },
      error: () => {
        // categories failing to load shouldn't block the journal list
      },
    });
  }

  categoryName(id: number): string {
    return this.categories().find((c) => c.id === id)?.name ?? '—';
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
    this.editingId = null;
    this.resetForm();
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(journal: Journal): void {
    this.modalMode.set('edit');
    this.editingId = journal.id;
    this.formCategoryId = journal.category_id;
    this.formTime = journal.time;
    this.formTimeType = journal.time_type;
    this.formTitle = journal.title;
    this.formDescription = journal.description;
    this.formImageUrl = journal.image_url;
    this.formText = journal.text;
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId = null;
    this.resetForm();
    this.formError.set(null);
  }

  /** Called by app-upload-file-controller's (uploaded) output. */
  onImageUploaded(result: UploadResult | null): void {
    this.formImageUrl = result?.url ?? '';
  }

  private resetForm(): void {
    this.formCategoryId = null;
    this.formTime = '';
    this.formTimeType = 'Min';
    this.formTitle = '';
    this.formDescription = '';
    this.formImageUrl = '';
    this.formText = '';
  }

  /** Mirrors the backend Joi schema so bad payloads never leave the client. */
  private validateForm(): string | null {
    if (!this.formCategoryId) return 'Please select a category.';
    if (!this.formTime.trim()) return 'Time is required.';
    if (!this.formTimeType.trim()) return 'Time type is required.';
    if (!this.formTitle.trim() || this.formTitle.trim().length < 3)
      return 'Title must be at least 3 characters.';
    if (!this.formDescription.trim()) return 'Description is required.';
    if (!this.formImageUrl.trim()) return 'Image URL is required.';
    if (!this.formText.trim()) return 'Content text is required.';
    return null;
  }

  saveJournal(): void {
    if (this.saving()) return;

    const validationError = this.validateForm();
    if (validationError) {
      this.formError.set(validationError);
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const payload = {
      category_id: this.formCategoryId,
      time: this.formTime.trim(),
      time_type: this.formTimeType,
      title: this.formTitle.trim(),
      description: this.formDescription.trim(),
      image_url: this.formImageUrl.trim(),
      text: this.formText.trim(),
    };

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.journalService.updateJournal(this.editingId, payload)
        : this.journalService.createJournal(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchJournals(this.searchTerm.trim());
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save journal. Please try again.');
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

  deleteJournal(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.journalService.deleteJournal(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchJournals(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.errorMsg.set('Failed to delete journal. Please try again.');
      },
    });
  }
}
