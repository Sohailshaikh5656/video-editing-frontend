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
import { TestimonialService } from '../../../services/admin/testimonial.service';
import { SharedModule } from '../../../shared/sharedModule';

interface Testimonial {
  id: number;
  first_name: string;
  last_name: string;
  rating: number;
  occupation: string;
  state: string;
  country: string;
  role: string;
  is_retained?: boolean;
  message: string;
  created_at?: string;
  updated_at?: string;
}

interface TestimonialForm {
  first_name: string;
  last_name: string;
  rating: number;
  occupation: string;
  state: string;
  country: string;
  role: string;
  is_retained: boolean;
  message: string;
}

const EMPTY_FORM: TestimonialForm = {
  first_name: '',
  last_name: '',
  rating: 0,
  occupation: '',
  state: '',
  country: '',
  role: '',
  is_retained: false,
  message: '',
};

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.scss',
})
export class TestimonialComponent implements OnInit, OnDestroy {
  private testimonialService = inject(TestimonialService);
  private searchSub$ = new Subject<string>();
  private sub = new Subscription();
  readonly Math = Math;
  readonly stars = [1, 2, 3, 4, 5];

  allTestimonials = signal<Testimonial[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  // modal state
  modalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  form: TestimonialForm = { ...EMPTY_FORM };
  editingId: number | null = null;
  saving = signal<boolean>(false);
  formErrors = signal<Record<string, string>>({});

  // delete confirm state
  deleteTargetId: number | null = null;
  deleting = signal<boolean>(false);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allTestimonials().length / this.pageSize)),
  );

  paginatedTestimonials = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allTestimonials().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchTestimonials();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((term) => {
          this.currentPage.set(1);
          this.fetchTestimonials(term.trim());
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Data ──────────────────────────────────

  fetchTestimonials(search = ''): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    const request$ = search
      ? this.testimonialService.searchTestimonial(search)
      : this.testimonialService.getTestimonial();

    request$.subscribe({
      next: (res: any) => {
        const list: Testimonial[] = Array.isArray(res)
          ? res
          : (res?.data ?? []);
        this.allTestimonials.set(list);

        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load testimonials. Please try again.');
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
    this.form = { ...EMPTY_FORM };
    this.editingId = null;
    this.formErrors.set({});
    this.modalOpen.set(true);
  }

  openEditModal(item: Testimonial): void {
    this.modalMode.set('edit');
    this.form = {
      first_name: item.first_name,
      last_name: item.last_name,
      rating: item.rating,
      occupation: item.occupation,
      state: item.state,
      country: item.country,
      role: item.role,
      is_retained: !!item.is_retained,
      message: item.message,
    };
    this.editingId = item.id;
    this.formErrors.set({});
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form = { ...EMPTY_FORM };
    this.editingId = null;
    this.formErrors.set({});
  }

  setRating(value: number): void {
    this.form.rating = value;
  }

  // ── Validation (mirrors the backend Joi schema) ───

  private validate(): boolean {
    const errors: Record<string, string> = {};
    const f = this.form;

    if (!f.first_name.trim() || f.first_name.trim().length < 3) {
      errors['first_name'] = 'First name must be at least 3 characters.';
    }
    if (!f.last_name.trim() || f.last_name.trim().length < 3) {
      errors['last_name'] = 'Last name must be at least 3 characters.';
    }
    if (f.rating === null || f.rating === undefined || f.rating <= 0) {
      errors['rating'] = 'Please select a rating.';
    }
    if (!f.occupation.trim()) {
      errors['occupation'] = 'Occupation is required.';
    }
    if (!f.state.trim()) {
      errors['state'] = 'State is required.';
    }
    if (!f.country.trim()) {
      errors['country'] = 'Country is required.';
    }
    if (!f.role.trim()) {
      errors['role'] = 'Role is required.';
    }
    if (!f.message.trim()) {
      errors['message'] = 'Message is required.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveTestimonial(): void {
    if (this.saving() || !this.validate()) return;

    this.saving.set(true);

    const payload = {
      ...this.form,
      first_name: this.form.first_name.trim(),
      last_name: this.form.last_name.trim(),
      occupation: this.form.occupation.trim(),
      state: this.form.state.trim(),
      country: this.form.country.trim(),
      role: this.form.role.trim(),
      message: this.form.message.trim(),
      rating: Number(this.form.rating.toFixed(2)),
    };

    const request$ =
      this.modalMode() === 'edit' && this.editingId !== null
        ? this.testimonialService.updateTestimonial(this.editingId, payload)
        : this.testimonialService.createTestimonial(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.fetchTestimonials(this.searchTerm.trim());
      },
      error: (err) => {
        this.saving.set(false);
        const apiMsg = err?.error?.message;
        this.formErrors.set({
          _general: apiMsg || 'Failed to save testimonial. Please try again.',
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

  deleteTestimonial(): void {
    if (this.deleteTargetId === null) return;
    this.deleting.set(true);

    this.testimonialService.deleteTestimonial(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.fetchTestimonials(this.searchTerm.trim());
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTargetId = null;
        this.errorMsg.set('Failed to delete testimonial. Please try again.');
      },
    });
  }
}