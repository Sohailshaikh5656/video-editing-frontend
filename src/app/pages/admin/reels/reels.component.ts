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
import { ReelsService } from '../../../services/admin/reels.service';
import { ReelGenreService } from '../../../services/admin/reel-genre.service';
import {
  UploadFileType,
  UploadResult,
} from '../../../services/upload/upload.models';
import { SharedModule } from '../../../shared/sharedModule';
import { UploadFileControllerComponent } from '../upload-file-controller/upload-file-controller.component';

interface Genre {
  id: number;
  name: string;
}

interface Reel {
  id: number;
  name: string;
  reel_url: string;
  thumbnail_url: string;
  category_id: number;
  category_name?: string;
  category?: string;
  our_role: string;
  start_date: string;
  end_date: string;
  description: string;
  views?: number;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UploadFileControllerComponent,
  ],
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss',
})
export class ReelsComponent implements OnInit, OnDestroy {
  private reelsService = inject(ReelsService);
  private genreService = inject(ReelGenreService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allReels = signal<Reel[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  editingId: number | null = null;
  saving = signal<boolean>(false);
  formError = signal<string | null>(null);

  // view modal
  viewTarget = signal<Reel | null>(null);

  // form state
  formName = '';
  formReelUrl = '';
  formThumbnailUrl = '';
  formCategoryId: number | null = null;
  formOurRole = '';
  formStartDate = ''; // datetime-local value
  formEndDate = '';
  formDescription = '';

  readonly videoTypes: UploadFileType[] = ['video'];
  readonly imageTypes: UploadFileType[] = ['image'];

  thumbnailUploadOpen = signal<boolean>(false);
  private thumbnailCustomised = false;

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allReels().length / this.pageSize)),
  );

  paginatedReels = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allReels().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchReels();
    this.fetchGenres();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchReels(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchReels(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.reelsService.searchReels(search)
      : this.reelsService.getReels();

    request$.subscribe({
      next: (res: any) => {
        const list: Reel[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allReels.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load reels. Please try again.');
        this.loading.set(false);
      },
    });
  }

  fetchGenres(): void {
    this.genreService.getReelsGenre().subscribe({
      next: (res: any) => {
        this.genres.set(Array.isArray(res) ? res : (res?.data ?? []));
      },
      error: () => this.genres.set([]),
    });
  }

  /** Category name: prefer what the API sends, else look it up by id. */
  categoryName(reel: Reel): string {
    return (
      reel.category_name ||
      (typeof reel.category === 'string' ? reel.category : '') ||
      this.genres().find((g) => g.id === reel.category_id)?.name ||
      ''
    );
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

  // ── View modal ────────────────────────────

  openView(reel: Reel): void {
    this.viewTarget.set(reel);
  }

  closeView(): void {
    this.viewTarget.set(null);
  }

  editFromView(reel: Reel): void {
    this.closeView();
    this.openEditModal(reel);
  }

  // ── Add / Edit modal ──────────────────────

  openAddModal(): void {
    this.modalMode.set('add');
    this.editingId = null;
    this.resetForm();
    this.modalOpen.set(true);
  }

  openEditModal(reel: Reel): void {
    this.modalMode.set('edit');
    this.editingId = reel.id;
    this.formError.set(null);
    this.formName = reel.name ?? '';
    this.formReelUrl = reel.reel_url ?? '';
    this.formThumbnailUrl = reel.thumbnail_url ?? '';
    this.formCategoryId = reel.category_id ?? null;
    this.formOurRole = reel.our_role ?? '';
    this.formStartDate = this.toInputValue(reel.start_date);
    this.formEndDate = this.toInputValue(reel.end_date);
    this.formDescription = reel.description ?? '';
    this.thumbnailUploadOpen.set(false);
    this.thumbnailCustomised = !!reel.thumbnail_url;
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.formName = '';
    this.formReelUrl = '';
    this.formThumbnailUrl = '';
    this.formCategoryId = null;
    this.formOurRole = '';
    this.formStartDate = '';
    this.formEndDate = '';
    this.formDescription = '';
    this.formError.set(null);
    this.thumbnailUploadOpen.set(false);
    this.thumbnailCustomised = false;
  }

  onReelUploaded(result: UploadResult | null): void {
    if (!result) return;
    this.formReelUrl = result.url;
    if (result.thumbnailUrl && !this.thumbnailCustomised) {
      this.formThumbnailUrl = result.thumbnailUrl;
    }
  }

  onThumbnailUploaded(result: UploadResult | null): void {
    if (!result) return;
    this.thumbnailCustomised = true;
    this.formThumbnailUrl = result.url;
  }

  onThumbnailUrlEdited(value: string): void {
    this.formThumbnailUrl = value;
    this.thumbnailCustomised = !!value.trim();
  }

  toggleThumbnailUpload(): void {
    this.thumbnailUploadOpen.update((open) => !open);
  }

  canSave(): boolean {
    return (
      !!this.formName.trim() &&
      !!this.formReelUrl.trim() &&
      this.formCategoryId !== null
    );
  }

  saveReel(): void {
    if (!this.canSave() || this.saving()) return;

    if (
      this.formStartDate &&
      this.formEndDate &&
      new Date(this.formEndDate) < new Date(this.formStartDate)
    ) {
      this.formError.set('End date cannot be earlier than the start date.');
      return;
    }
    this.formError.set(null);

    const payload = {
      name: this.formName.trim(),
      reel_url: this.formReelUrl.trim(),
      thumbnail_url: this.formThumbnailUrl.trim(),
      category_id: Number(this.formCategoryId),
      our_role: this.formOurRole.trim(),
      start_date: this.toIso(this.formStartDate),
      end_date: this.toIso(this.formEndDate),
      description: this.formDescription.trim(),
    };

    this.saving.set(true);

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.reelsService.updateReels(this.editingId, payload)
        : this.reelsService.createReels(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchReels(this.searchTerm.trim());
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save reel. Please try again.');
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

  deleteReel(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.reelsService.deleteReels(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchReels(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.errorMsg.set('Failed to delete reel. Please try again.');
      },
    });
  }

  // ── Date helpers ───────────────────────────

  /** ISO string -> value for <input type="datetime-local"> (local time). */
  private toInputValue(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** datetime-local value -> ISO string for the API. */
  private toIso(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
}
