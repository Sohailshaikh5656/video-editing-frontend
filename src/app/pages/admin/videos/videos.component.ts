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
import {
  VideoPayload,
  VideoService,
} from '../../../services/admin/video.service';
import { VideoTagsService } from '../../../services/admin/video-tags.service';
import {
  UploadFileType,
  UploadResult,
} from '../../../services/upload/upload.models';
import { SharedModule } from '../../../shared/sharedModule';
import { UploadFileControllerComponent } from '../upload-file-controller/upload-file-controller.component';

interface Tag {
  id: number;
  tags: string;
}

interface Video {
  id: number;
  title: string;
  name: string;
  description: string;
  vedio_url: string;
  thumbnail_url: string;
  views: number;
  cuts: number;
  is_home_screen: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  category: string[]; // tag names, e.g. ["Brand", "Collabe"]
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UploadFileControllerComponent,
  ],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent implements OnInit, OnDestroy {
  private videoService = inject(VideoService);
  private tagsService = inject(VideoTagsService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allVideos = signal<Video[]>([]);
  allTags = signal<Tag[]>([]);
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

  // form state
  formTitle = '';
  formName = '';
  formDescription = '';
  formVideoUrl = '';
  formThumbnailUrl = '';
  formViews = 0;
  selectedTagIds = signal<number[]>([]);

  /** Media-kind restrictions passed to the embedded upload widgets. */
  readonly videoTypes: UploadFileType[] = ['video'];
  readonly imageTypes: UploadFileType[] = ['image'];

  // optional thumbnail upload state
  thumbnailUploadOpen = signal<boolean>(false);
  /** true once the user picked their own thumbnail (upload or manual edit). */
  private thumbnailCustomised = false;

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allVideos().length / this.pageSize)),
  );

  paginatedVideos = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allVideos().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchVideos();
    this.fetchTags();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchVideos(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchVideos(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.videoService.searchVideo(search)
      : this.videoService.getVideo();

    request$.subscribe({
      next: (res: any) => {
        const list: Video[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allVideos.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load videos. Please try again.');
        this.loading.set(false);
      },
    });
  }

  fetchTags(): void {
    this.tagsService.getAllTags().subscribe({
      next: (res: any) => {
        this.allTags.set(Array.isArray(res) ? res : (res?.data ?? []));
      },
      error: () => this.allTags.set([]),
    });
  }

  /** Tags on a video can come back as ids or as full objects. */
  tagLabel(tag: number | Tag): string {
    if (typeof tag === 'object') return tag.tags;
    return this.allTags().find((t) => t.id === tag)?.tags ?? `#${tag}`;
  }

  private tagId(tag: number | Tag): number {
    return typeof tag === 'object' ? tag.id : tag;
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
    this.modalOpen.set(true);
  }

  openEditModal(video: Video): void {
    this.modalMode.set('edit');
    this.editingId = video.id;
    this.formTitle = video.title;
    this.formName = video.name;
    this.formDescription = video.description;
    this.formVideoUrl = video.vedio_url;
    this.formThumbnailUrl = video.thumbnail_url;
    this.formViews = video.views ?? 0;
    this.selectedTagIds.set(
      this.allTags()
        .filter((t) => (video.category ?? []).includes(t.tags))
        .map((t) => t.id),
    );
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.formTitle = '';
    this.formName = '';
    this.formDescription = '';
    this.formVideoUrl = '';
    this.formThumbnailUrl = '';
    this.formViews = 0;
    this.selectedTagIds.set([]);
    this.thumbnailUploadOpen.set(false);
    this.thumbnailCustomised = false;
  }

  onVideoUploaded(result: UploadResult | null): void {
    // The upload widget emits null whenever it is reset; ignore that so we
    // don't wipe URLs that were pre-filled while editing.
    if (!result) return;
    this.formVideoUrl = result.url;

    // Auto-fill the provider-generated poster while the user has not picked a
    // thumbnail of their own — the thumbnail stays optional either way.
    if (result.thumbnailUrl && !this.thumbnailCustomised) {
      this.formThumbnailUrl = result.thumbnailUrl;
    }
  }

  /** Optional: replaces the auto-generated poster with a custom image. */
  onThumbnailUploaded(result: UploadResult | null): void {
    if (!result) return;
    this.thumbnailCustomised = true;
    this.formThumbnailUrl = result.url;
  }

  /** Keeps the auto-filled poster from overwriting a manually typed value. */
  onThumbnailUrlEdited(value: string): void {
    this.formThumbnailUrl = value;
    this.thumbnailCustomised = !!value.trim();
  }

  toggleThumbnailUpload(): void {
    this.thumbnailUploadOpen.update((open) => !open);
  }

  toggleTag(id: number): void {
    this.selectedTagIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  canSave(): boolean {
    return !!this.formTitle.trim() && !!this.formVideoUrl.trim();
  }

  saveVideo(): void {
    if (!this.canSave() || this.saving()) return;

    const payload: VideoPayload = {
      title: this.formTitle.trim(),
      name: this.formName.trim(),
      description: this.formDescription.trim(),
      vedio_url: this.formVideoUrl.trim(),
      thumbnail_url: this.formThumbnailUrl.trim(),
      views: Number(this.formViews) || 0,
      tags: this.selectedTagIds(),
    };

    this.saving.set(true);

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.videoService.updateVideo(this.editingId, payload)
        : this.videoService.createVideo(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchVideos(this.searchTerm.trim());
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to save video. Please try again.');
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

  deleteVideo(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.videoService.deleteVideo(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchVideos(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.errorMsg.set('Failed to delete video. Please try again.');
      },
    });
  }

  viewTarget = signal<Video | null>(null);

  openView(video: Video): void {
    this.viewTarget.set(video);
  }

  closeView(): void {
    this.viewTarget.set(null);
  }

  editFromView(video: Video): void {
    this.closeView();
    this.openEditModal(video);
  }
}
