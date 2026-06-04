import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemService, Category, Item, DisposedRecord, DateUtilService, SEARCH_CONFIG } from 'shared-lib';
import { CountdownSummaryComponent, CountdownChipComponent, PaginationComponent, DeleteConfirmModalComponent, ReturnConfirmModalComponent } from 'design-system';

@Component({
  selector: 'app-root',
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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  activeView: 'found' | 'expired' | 'report' = 'found';
  private destroy$ = new Subject<void>();

  // Central load trigger for switchMap — prevents stale in-flight requests
  private loadTrigger$ = new Subject<void>();

  // Core Data
  items: Item[] = [];
  pageItems: Item[] = [];
  categories: Category[] = [];

  // Reactive Form Controls
  searchControl = new FormControl('', { nonNullable: true });
  locationControl = new FormControl('', { nonNullable: true });

  // Found List Filters
  searchTerm = '';
  filterLocation = '';
  filterCountdown = '';

  // Pagination — Found Items
  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  // Edit / Modals States for Found Items
  editItem: Item | null = null;
  editStatus = 'Not Returned';
  editStudentName = '';
  editRollNo = '';
  editPhone = '';
  editEmail = '';
  editReturnedDate = '';
  editReturnedTime = '';
  editRemarks = '';

  pendingReturnItem: Item | null = null;
  pendingDeleteId: string | null = null;

  // Expired Items States
  expiredItems: Item[] = [];
  totalExpiredRecords = 0;
  selectedExpiredItem: Item | null = null;

  disposalLocation = '';
  donatedTo = 'None';
  disposalNotes = '';
  showDisposalConfirm = false;
  socialClubs = ['NSS', 'KCDC', 'NCC', 'Other'];

  // Report Item Form States
  reportItemType: 'lost' | 'found' = 'found';
  reportContactType: 'student' | 'staff' = 'student';
  reportSubmitted = false;
  reportForm = {
    name: '',
    location: '',
    date: '',
    collectFrom: '',
    description: '',
    image: '',
    studentName: '',
    rollNo: '',
    phone: '',
    email: '',
    staffName: '',
    employeeId: '',
    department: '',
    staffPhone: '',
    staffEmail: ''
  };
  collectFromOptions = ['Admin Reception', 'Main Reception', 'Humanities Reception'];
  todayDate = '';

  // Toast notifications
  toastMessage = '';
  toastDescription = '';

  constructor(
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

    this.updateView(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const navEnd = event as NavigationEnd;
      this.updateView(navEnd.urlAfterRedirects || navEnd.url);
    });

    this.loadCategories();

    // ── Central Found Items load pipeline with switchMap ────────────────
    // switchMap automatically cancels any previous in-flight HTTP request
    // when a new load is triggered, preventing race conditions.
    this.loadTrigger$.pipe(
      switchMap(() => {
        const filters: any = {
          page: this.currentPage,
          pageSize: this.rowsPerPage
        };
        if (this.searchTerm)    filters.search          = this.searchTerm;
        if (this.filterLocation) filters.location       = this.filterLocation;
        if (this.filterCountdown) filters.countdownFilter = this.filterCountdown;
        return this.itemService.getFoundItems(filters).pipe(
          catchError(() => of(null))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (res && res.items) {
        this.items     = res.items;
        this.pageItems = res.items;
        this.totalRecords = res.totalItems || 0;
      } else {
        this.items        = [];
        this.pageItems    = [];
        this.totalRecords = 0;
      }
      this.cdr.markForCheck();
    });

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
        if (this.activeView === 'found') {
          this.currentPage = 1;
          this.loadTrigger$.next();
        } else if (this.activeView === 'expired') {
          this.currentPage = 1;
          this.loadExpiredItems();
        }
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
      if (this.activeView === 'found') {
        this.currentPage = 1;
        this.loadTrigger$.next();
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(url: string): void {
    // Reset controls quietly to avoid triggering dual valueChanges
    this.searchControl.setValue('', { emitEvent: false });
    this.locationControl.setValue('', { emitEvent: false });
    this.searchTerm = '';
    this.filterLocation = '';
    this.filterCountdown = '';
    this.currentPage = 1;

    if (url.includes('expired-items')) {
      this.activeView = 'expired';
      this.loadExpiredItems();
    } else if (url.includes('report')) {
      this.activeView = 'report';
      this.resetReportForm();
    } else {
      this.activeView = 'found';
      this.loadItems();
    }
  }

  loadCategories(): void {
    this.itemService.getPublicCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.cdr.markForCheck();
      }
    });
  }

  // --- Found List view handlers ---
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

  openEditModal(item: Item): void {
    this.editItem = item;
    this.editStatus = item.status;
    this.editStudentName = item.returnedTo?.studentName || '';
    this.editRollNo = item.returnedTo?.rollNo || '';
    this.editPhone = item.returnedTo?.phone || '';
    this.editEmail = item.returnedTo?.email || '';
    this.editReturnedDate = item.returnedTo?.returnedDate
      ? new Date(item.returnedTo.returnedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    this.editReturnedTime = item.returnedTo?.returnedTime || '10:00';
    this.editRemarks = item.returnedTo?.remarks || '';
  }

  isReturnFormValid(): boolean {
    if (this.editStatus !== 'Returned') return true;
    return !!(
      this.editStudentName.trim() &&
      this.editRollNo.trim() &&
      this.editPhone.trim() &&
      this.editEmail.trim() &&
      this.editReturnedDate &&
      this.editReturnedTime
    );
  }

  handleSaveEdit(): void {
    if (!this.editItem || !this.isReturnFormValid()) return;
    if (this.editStatus === 'Returned') {
      this.pendingReturnItem = this.editItem;
      this.editItem = null;
      return;
    }
    // Simple update without return confirmation (status remains Not Returned)
    this.editItem = null;
  }

  confirmReturn(): void {
    if (!this.pendingReturnItem || !this.pendingReturnItem._id) return;
    const item = this.pendingReturnItem;

    const update = {
      status: 'Returned',
      studentName: this.editStudentName.trim(),
      rollNo: this.editRollNo.trim(),
      phone: this.editPhone.trim(),
      email: this.editEmail.trim(),
      returnedDate: this.dateUtil.toUtcIsoString(this.editReturnedDate, this.editReturnedTime),
      returnedTime: this.editReturnedTime,
      remarks: this.editRemarks.trim()
    };

    this.itemService.updateFoundItem(item._id!, update).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast('Item marked as Returned', `${item.name} has been moved to Returned History.`);
        this.pendingReturnItem = null;
        this.loadTrigger$.next();
      },
      error: (err) => {
        this.showToast('Error', err.message || 'Failed to complete return.');
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(): void {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;

    this.itemService.deleteFoundItem(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast('Item deleted successfully.', '');
        this.pendingDeleteId = null;
        this.loadTrigger$.next();
      },
      error: (err) => {
        this.showToast('Error', 'Unable to delete item. Please try again.');
        this.pendingDeleteId = null;
        this.cdr.markForCheck();
      }
    });
  }

  // --- Expired view handlers (fully server-side) ---
  loadExpiredItems(): void {
    const filters: any = {
      page: this.currentPage,
      pageSize: this.rowsPerPage
    };
    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }

    this.itemService.getExpiredItems(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res && res.items) {
          this.expiredItems = res.items;
          this.totalExpiredRecords = res.totalItems || 0;
        } else {
          this.expiredItems = [];
          this.totalExpiredRecords = 0;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.expiredItems = [];
        this.totalExpiredRecords = 0;
        this.cdr.markForCheck();
      }
    });
  }

  onExpiredPageChange(page: number): void {
    this.currentPage = page;
    this.loadExpiredItems();
  }

  onExpiredRowsPerPageChange(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.loadExpiredItems();
  }

  openDisposalModal(item: Item): void {
    this.selectedExpiredItem = item;
    this.disposalLocation = '';
    this.donatedTo = 'None';
    this.disposalNotes = '';
    this.showDisposalConfirm = false;
  }

  submitDisposal(): void {
    if (!this.selectedExpiredItem || !this.selectedExpiredItem._id || !this.disposalLocation.trim()) return;
    const item = this.selectedExpiredItem;

    const disposal = {
      disposalLocation: this.disposalLocation.trim(),
      donatedTo: this.donatedTo === 'None' ? '' : this.donatedTo,
      notes: this.disposalNotes.trim()
    };

    this.itemService.disposeItem(item._id!, 'Found', disposal).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showToast('Item marked as disposed', `${item.name} has been moved to History.`);
        this.selectedExpiredItem = null;
        this.loadExpiredItems();
      },
      error: (err) => {
        this.showToast('Error', err.message || 'Disposal failed.');
        this.cdr.markForCheck();
      }
    });
  }

  // --- Report Item view handlers ---
  resetReportForm(): void {
    this.reportSubmitted = false;
    this.reportForm = {
      name: '', location: '', date: '', collectFrom: '', description: '', image: '',
      studentName: '', rollNo: '', phone: '', email: '',
      staffName: '', employeeId: '', department: '', staffPhone: '', staffEmail: ''
    };
  }

  handleTypeSwitch(type: 'lost' | 'found'): void {
    this.reportItemType = type;
    this.resetReportForm();
  }

  handleReportSubmit(e: Event): void {
    e.preventDefault();

    // Map report fields to backend schema
    const itemPayload: any = {
      name: this.reportForm.name,
      location: this.reportForm.location,
      date: this.dateUtil.toUtcIsoString(this.reportForm.date),
      description: this.reportForm.description,
      image: this.reportForm.image || '',
      contactType: this.reportContactType
    };

    if (this.reportItemType === 'found') {
      itemPayload.collectFrom = this.reportForm.collectFrom;
    }

    if (this.reportContactType === 'student') {
      itemPayload.studentName = this.reportForm.studentName;
      itemPayload.rollNo = this.reportForm.rollNo;
      itemPayload.phone = this.reportForm.phone;
      itemPayload.email = this.reportForm.email;
    } else {
      itemPayload.staffName = this.reportForm.staffName;
      itemPayload.employeeId = this.reportForm.employeeId;
      itemPayload.department = this.reportForm.department;
      itemPayload.staffPhone = this.reportForm.staffPhone;
      itemPayload.staffEmail = this.reportForm.staffEmail;
    }

    const serviceCall = this.reportItemType === 'lost'
      ? this.itemService.createLostItem(itemPayload)
      : this.itemService.createFoundItem(itemPayload);

    serviceCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.reportSubmitted = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showToast('Error Reporting Item', err.message || 'Failed to submit report.');
        this.cdr.markForCheck();
      }
    });
  }

  cancelReport(): void {
    this.router.navigate(['/admin/lost-items']);
  }

  // General Toast / Helpers
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

  getPendingDeleteName(): string {
    if (!this.pendingDeleteId) return '';
    return this.items.find(i => i._id === this.pendingDeleteId)?.name || '';
  }

  getPendingDeleteItemId(): string {
    if (!this.pendingDeleteId) return '';
    return this.items.find(i => i._id === this.pendingDeleteId)?.itemId || '';
  }

  // ── TrackBy functions — prevent full list re-renders on every change ──
  trackByItemId(index: number, item: Item): string {
    return item._id || item.itemId || String(index);
  }

  formatDate(dateStr: string, includeTime = false): string {
    return this.dateUtil.formatDisplayDate(dateStr, includeTime);
  }

  isExpired(dateStr: string): boolean {
    return this.dateUtil.isExpired(dateStr);
  }

  getDaysElapsed(dateStr: string): number {
    return this.dateUtil.getDaysElapsed(dateStr);
  }

  getDaysRemaining(dateStr: string): number {
    return this.dateUtil.getDaysRemaining(dateStr);
  }

  getCountdownStatus(dateStr: string): 'active' | 'expiring' | 'last10' | 'expired' {
    return this.dateUtil.getCountdownStatus(dateStr);
  }

  private parseDate(dateStr: string): Date {
    return this.dateUtil.parseDate(dateStr);
  }
}
