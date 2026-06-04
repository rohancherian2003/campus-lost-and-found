import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
      <!-- Left: record count + rows per page -->
      <div class="flex items-center gap-3 flex-wrap">
        <p class="text-xs text-gray-500" style="font-family: 'DM Sans', sans-serif">
          Showing <span class="font-semibold text-gray-700">{{ start }}</span>–<span class="font-semibold text-gray-700">{{ end }}</span> of <span class="font-semibold text-gray-700">{{ totalRecords }}</span> items
        </p>
        <div class="flex items-center gap-1.5" *ngIf="showRowsPerPage">
          <span class="text-xs text-gray-400" style="font-family: 'DM Sans', sans-serif">Rows per page:</span>
          <select
            [value]="rowsPerPage"
            (change)="onRowsPerPageChange($event)"
            class="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
            style="font-family: 'DM Sans', sans-serif"
          >
            <option *ngFor="let n of rowOptions" [value]="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <!-- Right: page navigation -->
      <div class="flex items-center gap-1">
        <button
          (click)="changePage(safePage - 1)"
          [disabled]="safePage === 1"
          class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          style="font-family: 'DM Sans', sans-serif"
        >
          &larr; Previous
        </button>

        <ng-container *ngIf="pageStart > 1">
          <button (click)="changePage(1)" class="w-8 h-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all duration-150 shadow-sm" style="font-family: 'DM Sans', sans-serif">1</button>
          <span class="text-gray-400 text-xs px-1" *ngIf="pageStart > 2">&hellip;</span>
        </ng-container>

        <button
          *ngFor="let n of pageNumbers"
          (click)="changePage(n)"
          class="w-8 h-8 text-xs rounded-lg border transition-all duration-150 shadow-sm"
          [ngClass]="{
            'bg-cyan-600 border-cyan-600 text-white': safePage === n,
            'border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600': safePage !== n
          }"
          style="font-family: 'DM Sans', sans-serif"
        >
          {{ n }}
        </button>

        <ng-container *ngIf="pageEnd < totalPages">
          <span class="text-gray-400 text-xs px-1" *ngIf="pageEnd < totalPages - 1">&hellip;</span>
          <button (click)="changePage(totalPages)" class="w-8 h-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all duration-150 shadow-sm" style="font-family: 'DM Sans', sans-serif">{{ totalPages }}</button>
        </ng-container>

        <button
          (click)="changePage(safePage + 1)"
          [disabled]="safePage === totalPages"
          class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          style="font-family: 'DM Sans', sans-serif"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent implements OnChanges {
  @Input() totalRecords = 0;
  @Input() currentPage = 1;
  @Input() rowsPerPage = 10;
  @Input() showRowsPerPage = true;
  @Input() rowOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() rowsPerPageChange = new EventEmitter<number>();

  totalPages = 1;
  safePage = 1;
  start = 0;
  end = 0;
  pageStart = 1;
  pageEnd = 1;
  pageNumbers: number[] = [];

  ngOnChanges(): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.rowsPerPage));
    this.safePage = Math.min(this.currentPage, this.totalPages);
    this.start = this.totalRecords === 0 ? 0 : (this.safePage - 1) * this.rowsPerPage + 1;
    this.end = Math.min(this.safePage * this.rowsPerPage, this.totalRecords);

    const maxVisible = 5;
    this.pageStart = Math.max(1, this.safePage - Math.floor(maxVisible / 2));
    this.pageEnd = Math.min(this.totalPages, this.pageStart + maxVisible - 1);
    if (this.pageEnd - this.pageStart + 1 < maxVisible) {
      this.pageStart = Math.max(1, this.pageEnd - maxVisible + 1);
    }
    this.pageNumbers = Array.from({ length: this.pageEnd - this.pageStart + 1 }, (_, i) => this.pageStart + i);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onRowsPerPageChange(event: any): void {
    const val = Number(event.target.value);
    this.rowsPerPageChange.emit(val);
  }
}
