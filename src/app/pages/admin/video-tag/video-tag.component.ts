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
import { VideoTagsService } from '../../../services/admin/video-tags.service';
import { SharedModule } from '../../../shared/sharedModule';

interface Tag {
  id: number;
  tags: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-video-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './video-tag.component.html',
  styleUrl: './video-tag.component.scss',
})
export class VideoTagsComponent implements OnInit, OnDestroy {
  private tagsService = inject(VideoTagsService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allTags = signal<Tag[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  formTagName = '';
  editingId: number | null = null;
  saving = signal<boolean>(false);

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allTags().length / this.pageSize)),
  );

  paginatedTags = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allTags().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchTags();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchTags(term.trim() || undefined);
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchTags(search?: string): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.tagsService.getAllTags(search).subscribe({
      next: (res: any) => {
        const list: Tag[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allTags.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load tags. Please try again.');
        this.loading.set(false);
      },
    });
  }

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
    this.formTagName = '';
    this.editingId = null;
    this.modalOpen.set(true);
  }

  openEditModal(tag: Tag): void {
    this.modalMode.set('edit');
    this.formTagName = tag.tags;
    this.editingId = tag.id;
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.formTagName = '';
    this.editingId = null;
  }

  saveTag(): void {
    const name = this.formTagName.trim();
    if (!name) return;

    this.saving.set(true);

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.tagsService.updateTags({ id: this.editingId, tag: name } as any)
        : this.tagsService.createTags({ tag: name });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchTags(this.searchTerm.trim() || undefined);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to save tag. Please try again.');
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

  deleteTag(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.tagsService.deleteTag(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchTags(this.searchTerm.trim() || undefined);
      },
      error: () => {
        this.deleting.set(false);
        this.errorMsg.set('Failed to delete tag. Please try again.');
      },
    });
  }
}
