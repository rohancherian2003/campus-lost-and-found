import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="onClose()"
      [style.backdrop-filter]="visible ? 'blur(4px)' : 'blur(0px)'"
      [style.background]="visible ? 'rgba(15,23,42,0.55)' : 'rgba(15,23,42,0)'"
      style="transition: background 0.25s, backdrop-filter 0.25s"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        [style.opacity]="visible ? 1 : 0"
        [style.transform]="visible ? 'scale(1)' : 'scale(0.93)'"
        style="transition: opacity 0.25s, transform 0.25s"
        class="bg-white shadow-2xl w-full max-w-sm overflow-hidden rounded-2xl"
      >
        <!-- Red top bar -->
        <div class="bg-red-500 px-6 pt-7 pb-5 flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg class="text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 class="text-white" style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 700">
            {{ title }}
          </h2>
        </div>

        <!-- Body -->
        <div class="px-6 pt-5 pb-6 flex flex-col items-center text-center">
          <ng-container *ngIf="!message; else customMsg">
            <p class="text-gray-700 text-sm leading-relaxed mb-1" style="font-family: 'DM Sans', sans-serif">
              Are you sure you want to delete
            </p>
            <p class="text-gray-900 font-semibold text-sm mb-4" style="font-family: 'DM Sans', sans-serif">
              "{{ itemName }}"?
            </p>
          </ng-container>
          <ng-template #customMsg>
            <p class="text-gray-700 text-sm leading-relaxed mb-4" style="font-family: 'DM Sans', sans-serif">
              {{ message }}
            </p>
          </ng-template>

          <!-- Item details card -->
          <div class="w-full border rounded-xl p-4 mb-4 text-left" [ngClass]="typeColors.bg + ' ' + typeColors.border">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2" style="font-family: 'DM Sans', sans-serif">
              Item Details
            </p>
            <p class="text-gray-900 font-semibold text-sm mb-1" style="font-family: 'DM Sans', sans-serif">
              {{ itemName }}
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-gray-500 text-xs" style="font-family: 'DM Sans', sans-serif">ID: {{ itemId }}</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" [ngClass]="typeColors.badge">
                {{ itemType }}
              </span>
            </div>
          </div>

          <!-- Warning -->
          <div class="flex items-center gap-1.5 mb-6">
            <svg class="text-red-400 w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-red-400 text-xs font-medium" style="font-family: 'DM Sans', sans-serif">
              This action cannot be undone.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 w-full">
            <button
              (click)="onClose()"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
              style="font-family: 'DM Sans', sans-serif"
            >
              Cancel
            </button>
            <button
              (click)="onConfirm()"
              class="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-150 shadow-sm flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
              style="font-family: 'DM Sans', sans-serif"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeleteConfirmModalComponent implements OnInit {
  @Input() itemName = '';
  @Input() itemId = '';
  @Input() itemType = 'Lost Item';
  @Input() title = 'Delete Item';
  @Input() message = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  visible = false;
  typeColors = { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.visible = true;
      this.cdr.markForCheck();
    });

    if (this.itemType === 'Lost Item') {
      this.typeColors = { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' };
    } else if (this.itemType === 'Found Item') {
      this.typeColors = { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
    } else {
      this.typeColors = { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };
    }
  }

  onClose(): void {
    this.visible = false;
    setTimeout(() => this.close.emit(), 250);
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
