import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ItemService, DisposedRecord, DateUtilService, SEARCH_CONFIG } from 'shared-lib';
import { PaginationComponent } from 'design-system';

interface ReturnedRecord {
  id: number;
  name: string;
  type: 'Lost' | 'Found';
  reportedDate: string;
  closedDate: string;
  studentName: string;
  rollNo: string;
  location: string;
  reporter: string;
  reporterPhone: string;
  reporterEmail: string;
}

interface LostNotFoundRecord {
  id: number;
  name: string;
  reportedDate: string;
  location: string;
  reporter: string;
  reporterPhone: string;
  reporterEmail: string;
  daysElapsed: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit, OnDestroy {
  activeTab: 'returned' | 'lost-not-found' | 'disposed' = 'returned';
  
  // Reactive Form Control
  searchControl = new FormControl('', { nonNullable: true });

  // Filters
  searchTerm = '';
  filterType = '';
  dateTo = '';
  todayDate = '';

  // Pagination
  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  // Counts for cards/tabs
  totalReturned = 0;
  totalLostNotFound = 0;
  totalDisposed = 0;
  totalFoundReturned = 0;

  returnedItems: ReturnedRecord[] = [];
  lostNotFoundItems: LostNotFoundRecord[] = [];
  disposedHistory: DisposedRecord[] = [];

  destroy$ = new Subject<void>();

  constructor(
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

    this.loadStats();
    this.loadActiveTabHistory();

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
        this.loadActiveTabHistory();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.itemService.getHistoryStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats) => {
        if (stats) {
          this.totalReturned = stats.returned || 0;
          this.totalLostNotFound = stats.lostNotFound || 0;
          this.totalDisposed = stats.disposed || 0;
          this.totalFoundReturned = stats.foundReturned || 0;
          this.cdr.markForCheck();
        }
      }
    });
  }

  loadActiveTabHistory(): void {
    const filters: any = {
      page: this.currentPage,
      pageSize: this.rowsPerPage
    };
    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    if (this.dateTo) {
      filters.dateTo = this.dateTo;
    }

    if (this.activeTab === 'returned') {
      if (this.filterType) {
        filters.type = this.filterType;
      }
      this.itemService.getReturnedHistory(filters).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          const items = res?.items || [];
          this.totalRecords = res?.totalItems || 0;
          this.returnedItems = items.map((i: any, index: number) => ({
            id: i.id || index,
            name: i.name,
            type: i.type || (i.reporter ? 'Lost' : 'Found'),
            reportedDate: i.reportedDate || i.dateFound || '',
            closedDate: i.closedDate || i.returnedTo?.returnedDate || i.returnedTo?.claimedDate || i.lastUpdated || '',
            studentName: i.studentName || i.returnedTo?.studentName || '',
            rollNo: i.rollNo || i.returnedTo?.rollNo || '',
            location: i.location || '—',
            reporter: (typeof i.reporter === 'object' && i.reporter ? i.reporter.name : i.reporter) || i.reporterName || '',
            reporterPhone: i.reporterPhone || i.reporter?.phone || '',
            reporterEmail: i.reporterEmail || i.reporter?.email || ''
          }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.returnedItems = [];
          this.totalRecords = 0;
          this.cdr.markForCheck();
        }
      });
    } else if (this.activeTab === 'lost-not-found') {
      this.itemService.getLostNotFoundHistory(filters).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          const items = res?.items || [];
          this.totalRecords = res?.totalItems || 0;
          this.lostNotFoundItems = items.map((i: any, index: number) => {
            const repDate = i.dateFound || i.reportedAt || '';
            let elapsed = 0;
            if (repDate) {
              try {
                const d = this.parseDate(repDate);
                elapsed = Math.floor((new Date().getTime() - d.getTime()) / 86400000);
              } catch (e) {
                elapsed = 60;
              }
            }
            return {
              id: i.id || index,
              name: i.name,
              reportedDate: repDate,
              location: i.location || '—',
              reporter: i.reporterName || i.reporter?.name || '—',
              reporterPhone: i.reporterPhone || i.reporter?.phone || '',
              reporterEmail: i.reporterEmail || i.reporter?.email || '',
              daysElapsed: elapsed
            };
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.lostNotFoundItems = [];
          this.totalRecords = 0;
          this.cdr.markForCheck();
        }
      });
    } else if (this.activeTab === 'disposed') {
      if (this.filterType) {
        filters.type = this.filterType;
      }
      this.itemService.getDisposedHistory(filters).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          this.disposedHistory = res?.items || [];
          this.totalRecords = res?.totalItems || 0;
          this.cdr.markForCheck();
        },
        error: () => {
          this.disposedHistory = [];
          this.totalRecords = 0;
          this.cdr.markForCheck();
        }
      });
    }
  }

  getFilteredReturned(): ReturnedRecord[] {
    return this.returnedItems;
  }

  getFilteredLostNotFound(): LostNotFoundRecord[] {
    return this.lostNotFoundItems;
  }

  getFilteredDisposed(): DisposedRecord[] {
    return this.disposedHistory;
  }

  getFoundReturnedCount(): number {
    return this.totalFoundReturned;
  }

  onTabChange(tab: 'returned' | 'lost-not-found' | 'disposed'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabHistory();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadActiveTabHistory();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadActiveTabHistory();
  }

  onRowsPerPageChange(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.loadActiveTabHistory();
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchTerm = '';
    this.filterType = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadActiveTabHistory();
  }

  formatDate(dateStr: string, includeTime = false): string {
    return this.dateUtil.formatDisplayDate(dateStr, includeTime);
  }

  private parseDate(dateStr: string): Date {
    return this.dateUtil.parseDate(dateStr);
  }
}
