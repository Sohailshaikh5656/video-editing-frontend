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
import { BrandService } from '../../../services/admin/brand.service';
import { SharedModule } from '../../../shared/sharedModule';
import { UploadFileControllerComponent } from '../upload-file-controller/upload-file-controller.component';
import { UploadResult } from '../../../services/upload/upload.models';
import { LoaderComponent } from '../../../components/common/loader/loader.component';
import { DrawerComponent } from '../../../components/common/drawer/drawer.component';

interface Brand {
  id: number;
  name: string;
  image_url: string;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UploadFileControllerComponent,
    LoaderComponent,
    DrawerComponent,
  ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss',
})
export class BrandComponent implements OnInit, OnDestroy {
  private brandService = inject(BrandService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;

  allBrands = signal<Brand[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  formName = '';
  formImageUrl = '';
  editingId: number | null = null;
  saving = signal<boolean>(false);
  formError = signal<string | null>(null);

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  // status toggle state
  togglingId = signal<number | null>(null);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allBrands().length / this.pageSize)),
  );

  paginatedBrands = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allBrands().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchBrands();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchBrands(term.trim() || undefined);
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchBrands(search?: string): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.brandService.getAllBrand(search).subscribe({
      next: (res: any) => {
        const list: Brand[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allBrands.set(list);

        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load brands. Please try again.');
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
    this.formImageUrl = '';
    this.editingId = null;
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(brand: Brand): void {
    this.modalMode.set('edit');
    this.formName = brand.name;
    this.formImageUrl = brand.image_url;
    this.editingId = brand.id;
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.formName = '';
    this.formImageUrl = '';
    this.editingId = null;
    this.formError.set(null);
  }

  /** Called by app-upload-file-controller's (uploaded) output. */
  onImageUploaded(result: UploadResult | null): void {
    if (!result) return;
    this.formImageUrl = result.url;
  }

  canSave(): boolean {
    return !!this.formName.trim() && !!this.formImageUrl.trim();
  }

  saveBrand(): void {
    if (!this.canSave() || this.saving()) return;

    this.saving.set(true);
    this.formError.set(null);

    const name = this.formName.trim();
    const image_url = this.formImageUrl.trim();

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.brandService.updateBrand(this.editingId, {
            name,
            image_url,
          } as any)
        : this.brandService.createBrand({ name, image_url } as any);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchBrands(this.searchTerm.trim() || undefined);
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save brand. Please try again.');
      },
    });
  }

  // ── Status toggle ──────────────────────────

  toggleStatus(brand: Brand): void {
    if (this.togglingId() !== null) return;

    const nextStatus = !brand.is_active;
    this.togglingId.set(brand.id);

    this.brandService.changeStatus(brand.id, nextStatus).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.allBrands.update((list) =>
          list.map((b) =>
            b.id === brand.id ? { ...b, is_active: nextStatus } : b,
          ),
        );
      },
      error: () => {
        this.togglingId.set(null);
        this.errorMsg.set('Failed to update status. Please try again.');
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

  deleteBrand(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.brandService.deleteBrand(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchBrands(this.searchTerm.trim() || undefined);
      },
      error: () => {
        this.deleting.set(false);
        this.errorMsg.set('Failed to delete brand. Please try again.');
      },
    });
  }
}
