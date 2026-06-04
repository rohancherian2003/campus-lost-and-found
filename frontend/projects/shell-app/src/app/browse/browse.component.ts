import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { ItemService, Category, Item, DateUtilService, SEARCH_CONFIG } from 'shared-lib';
import { CountdownBarComponent, PaginationComponent } from 'design-system';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountdownBarComponent, PaginationComponent],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseComponent implements OnInit, OnDestroy {
  type: 'lost' | 'found' = 'found';
  items: Item[] = [];
  categories: Category[] = [];

  // Reactive Form Controls
  searchControl = new FormControl('', { nonNullable: true });
  locationControl = new FormControl('', { nonNullable: true });
  categoryControl = new FormControl('', { nonNullable: true });
  countdownControl = new FormControl('', { nonNullable: true });
  dateFromControl = new FormControl('', { nonNullable: true });

  // Filter States
  searchTerm = '';
  locationFilter = '';
  selectedCategory = '';
  countdownFilter = '';
  dateFrom = '';
  dateTo = '';
  todayDate = '';

  // Pagination States
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;
  totalPages = 1;

  // UI States
  loading = false;
  hasError = false;

  destroy$ = new Subject<void>();
  searchSubject$ = new BehaviorSubject<void>(undefined);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private dateUtil: DateUtilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.todayDate = `${yyyy}-${mm}-${dd}`;

    // Watch path parameter /browse/lost or /browse/found
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const typeParam = params['type'];
      this.type = typeParam === 'lost' ? 'lost' : 'found';
      this.resetFilters();
      this.loadCategories();
    });

    // Debounced search term valueChanges pipeline
    this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_CONFIG.DEFAULT_DEBOUNCE),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      const trimmed = val.trim();
      // Apply minimum character threshold unless clearing search
      if (trimmed.length === 0 || trimmed.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
        this.searchTerm = trimmed;
        this.currentPage = 1;
        this.searchSubject$.next();
      }
    });

    // Debounced location valueChanges pipeline
    this.locationControl.valueChanges.pipe(
      debounceTime(SEARCH_CONFIG.DEFAULT_DEBOUNCE),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.locationFilter = val.trim();
      this.currentPage = 1;
      this.searchSubject$.next();
    });

    // Immediate category valueChanges
    this.categoryControl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.selectedCategory = val;
      this.currentPage = 1;
      this.searchSubject$.next();
    });

    // Immediate countdown valueChanges
    this.countdownControl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.countdownFilter = val;
      this.currentPage = 1;
      this.searchSubject$.next();
    });

    // Immediate dateFrom valueChanges
    this.dateFromControl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.dateFrom = val;
      this.currentPage = 1;
      this.searchSubject$.next();
    });

    // Central HTTP query pipeline utilizing switchMap for automatic request cancellation
    this.searchSubject$.pipe(
      tap(() => {
        this.loading = true;
        this.hasError = false;
        this.cdr.markForCheck();
      }),
      switchMap(() => {
        const filters = {
          page: this.currentPage,
          pageSize: this.pageSize,
          search: this.searchTerm,
          location: this.locationFilter,
          category: this.selectedCategory,
          countdownFilter: this.countdownFilter,
          dateFrom: this.dateFrom ? this.dateUtil.toUtcIsoString(this.dateFrom) : '',
          dateTo: this.dateTo ? this.dateUtil.toUtcIsoString(this.dateTo) : ''
        };
        return this.itemService.getPublicItems(this.type, filters).pipe(
          catchError(() => {
            this.hasError = true;
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res) {
          this.items = res.items || [];
          this.totalItems = res.totalItems || 0;
          this.totalPages = res.totalPages || 1;
        } else {
          this.items = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.hasError = true;
        this.items = [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.itemService.getPublicCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.cdr.markForCheck();
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.locationFilter ||
      this.selectedCategory ||
      this.countdownFilter ||
      this.dateFrom ||
      this.dateTo
    );
  }

  clearFilters(): void {
    this.resetFilters();
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.locationControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue('', { emitEvent: false });
    this.countdownControl.setValue('', { emitEvent: false });
    this.dateFromControl.setValue('', { emitEvent: false });
    this.searchTerm = '';
    this.locationFilter = '';
    this.selectedCategory = '';
    this.countdownFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.searchSubject$.next();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchSubject$.next();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  formatDate(dateStr: string, includeTime = false): string {
    return this.dateUtil.formatDisplayDate(dateStr, includeTime);
  }
}
