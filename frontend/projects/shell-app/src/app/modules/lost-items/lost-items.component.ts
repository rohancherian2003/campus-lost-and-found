import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemService, Item, DateUtilService, SEARCH_CONFIG } from 'shared-lib';
import { CountdownSummaryComponent, CountdownChipComponent, PaginationComponent, DeleteConfirmModalComponent, ReturnConfirmModalComponent } from 'design-system';

@Component({
  selector: 'app-lost-items',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CountdownSummaryComponent,
    CountdownChipComponent,
    PaginationComponent,
    DeleteConfirmModalComponent,
    ReturnConfirmModalComponent
  ],
  templateUrl: './lost-items.component.html',
  styleUrls: ['./lost-items.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LostItemsComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  pageItems: Item[] = [];

  // Reactive Form Controls
  searchControl = new FormControl('', { nonNullable: true });
  locationControl = new FormControl('', { nonNullable: true });

  // Filters
  searchTerm = '';
  filterLocation = '';
  filterCountdown = '';

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  // Edit / Action Modals States
  editItem: Item | null = null;
  editStatus = '';

  pendingReturnItem: Item | null = null;
  pendingDeleteId: string | null = null;

  // Custom Toast State
  toastMessage = '';
  toastDescription = '';

  destroy$ = new Subject<void>();

  // Central load trigger with switchMap — cancels stale in-flight requests
  private loadTrigger$ = new Subject<void>();

  constructor(
    private itemService: ItemService,
    private dateUtil: DateUtilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ── Central load pipeline with switchMap ────────────────────────────
    this.loadTrigger$.pipe(
      switchMap(() => {
        const filters: any = {
          page: this.currentPage,
          pageSize: this.rowsPerPage
        };
        if (this.searchTerm)     filters.search          = this.searchTerm;
        if (this.filterLocation) filters.location        = this.filterLocation;
        if (this.filterCountdown) filters.countdownFilter = this.filterCountdown;
        return this.itemService.getLostItems(filters).pipe(
          catchError(() => of(null))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (res && res.items) {
        this.items        = res.items;
        this.pageItems    = res.items;
        this.totalRecords = res.totalItems || 0;
      } else {
        this.items        = [];
        this.pageItems    = [];
        this.totalRecords = 0;
      }
      this.cdr.markForCheck();
    });

    // Initial data load
    this.loadTrigger$.next();

    // ── Debounced search term valueChanges pipeline ─────────────────────
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
        this.loadTrigger$.next();
        this.cdr.markForCheck();
      }
    });

    // ── Debounced location valueChanges pipeline ────────────────────────
    this.locationControl.valueChanges.pipe(
      debounceTime(SEARCH_CONFIG.DEFAULT_DEBOUNCE),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.filterLocation = val.trim();
      this.currentPage = 1;
      this.loadTrigger$.next();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(): void {
    this.loadTrigger$.next();
  }

  applyFilters(): void {
    this.loadTrigger$.next();
  }

  updatePageItems(): void {
    this.loadTrigger$.next();
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.locationControl.setValue('', { emitEvent: false });
    this.searchTerm = '';
    this.filterLocation = '';
    this.filterCountdown = '';
    this.currentPage = 1;
    this.loadTrigger$.next();
    this.cdr.markForCheck();
  }

  handleCountdownFilter(val: string): void {
    this.filterCountdown = val;
    this.currentPage = 1;
    this.loadTrigger$.next();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTrigger$.next();
  }

  onRowsPerPageChange(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.loadTrigger$.next();
  }

  handleEdit(item: Item): void {
    if (item.status === 'Returned') return;
    this.editItem = item;
    this.editStatus = item.status;
  }

  handleSaveEdit(): void {
    if (!this.editItem) return;
    if (this.editStatus === 'Returned') {
      this.pendingReturnItem = this.editItem;
      this.editItem = null;
      return;
    }
    // Just save status changes (e.g. status remains Not Returned)
    this.editItem = null;
  }

  confirmReturn(): void {
    if (!this.pendingReturnItem || !this.pendingReturnItem._id) return;
    const item = this.pendingReturnItem;

    // For lost item, returned claimant is the reporter student!
    const update = {
      status: 'Returned',
      studentName: item.reporter?.name || 'Claimant',
      rollNo: item.reporter?.rollNo || 'STU-UNKNOWN',
      phone: item.reporter?.phone || '',
      email: item.reporter?.email || ''
    };

    this.itemService.updateLostItem(item._id!, update).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast('Item marked as Returned', `${item.name} has been moved to Returned History.`);
        this.pendingReturnItem = null;
        this.loadTrigger$.next();
      },
      error: (err) => {
        this.showToast('Error', err.message || 'Failed to return item.');
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    const item = this.items.find(i => i._id === id);

    this.itemService.deleteLostItem(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast('Item deleted successfully', `${item?.name || 'Item'} has been removed.`);
        this.pendingDeleteId = null;
        this.loadTrigger$.next();
      },
      error: (err) => {
        this.showToast('Error', err.message || 'Failed to delete item.');
        this.cdr.markForCheck();
      }
    });
  }

  getPendingDeleteName(): string {
    if (!this.pendingDeleteId) return '';
    return this.items.find(i => i._id === this.pendingDeleteId)?.name || '';
  }

  getPendingDeleteItemId(): string {
    if (!this.pendingDeleteId) return '';
    return this.items.find(i => i._id === this.pendingDeleteId)?.itemId || '';
  }

  showToast(message: string, description: string): void {
    this.toastMessage = message;
    this.toastDescription = description;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.toastMessage = '';
      this.toastDescription = '';
      this.cdr.markForCheck();
    }, 4000);
  }

  // ── TrackBy — prevents full list re-renders on every change ──────────
  trackByItemId(index: number, item: Item): string {
    return item._id || item.itemId || String(index);
  }

  formatDate(dateStr: string, includeTime = false): string {
    return this.dateUtil.formatDisplayDate(dateStr, includeTime);
  }

  // Helper date functions matching Countdown summary
  isExpired(dateStr: string): boolean {
    return this.dateUtil.isExpired(dateStr);
  }

  getDaysElapsed(dateStr: string): number {
    return this.dateUtil.getDaysElapsed(dateStr);
  }

  getCountdownStatus(dateStr: string): 'active' | 'expiring' | 'last10' | 'expired' {
    return this.dateUtil.getCountdownStatus(dateStr);
  }

  parseDate(dateStr: string): Date {
    return this.dateUtil.parseDate(dateStr);
  }
}
