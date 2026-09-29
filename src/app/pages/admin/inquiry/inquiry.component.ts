import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Inquiry, InquiryService } from '../../../services/admin/inquiry.service';
import { SharedModule } from '../../../shared/sharedModule';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.scss',
})
export class InquiryComponent implements OnInit, OnDestroy {
  private readonly inquiryService = inject(InquiryService);
  private readonly searchSub$ = new Subject<string>();
  private readonly sub = new Subscription();
  readonly Math = Math;

  allInquiries = signal<Inquiry[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  searchTerm = '';
  currentPage = signal<number>(1);
  pageSize = 10;

  viewTarget = signal<Inquiry | null>(null);

  filteredInquiries = computed<Inquiry[]>(() => {
    const term = this.searchTerm.trim().toLowerCase();
    const all = this.allInquiries();
    if (!term) return all;

    return all.filter((inquiry) =>
      [inquiry.full_name, inquiry.email, inquiry.company, inquiry.project_type]
        .filter((field): field is string => !!field)
        .some((field) => field.toLowerCase().includes(term)),
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredInquiries().length / this.pageSize)),
  );

  paginatedInquiries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredInquiries().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.fetchInquiries();

    this.sub.add(
      this.searchSub$
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => this.currentPage.set(1)),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchInquiries(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.inquiryService.getInquiry().subscribe({
      next: (res: any) => {
        const list: Inquiry[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.allInquiries.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load inquiries. Please try again.');
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

  openView(inquiry: Inquiry): void {
    this.viewTarget.set(inquiry);
  }

  closeView(): void {
    this.viewTarget.set(null);
  }

  trackInquiry = (i: Inquiry) => i.id ?? i.email;
}
