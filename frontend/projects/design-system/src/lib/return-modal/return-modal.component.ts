import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-return-modal',
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
        <!-- Green header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 pt-7 pb-5 flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg class="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-white" style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; margin: 0">
            Confirm Item Return
          </h2>
        </div>

        <!-- Body -->
        <div class="p-6 flex flex-col gap-4">
          <p class="text-gray-700 text-sm text-center margin-0" style="font-family: 'DM Sans', sans-serif">
            Are you sure this item has been successfully returned to its owner?
          </p>

          <!-- Item details -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2" style="font-family: 'DM Sans', sans-serif">
              Item Details
            </p>
            <p class="text-gray-900 font-semibold text-sm mb-1.5" style="font-family: 'DM Sans', sans-serif">{{ itemName }}</p>
            <div class="flex gap-2 items-center flex-wrap">
              <span class="text-gray-500 text-xs" style="font-family: 'DM Sans', sans-serif">ID: {{ itemId }}</span>
              <span class="flex items-center gap-1 text-xs" style="font-family: 'DM Sans', sans-serif">
                <span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Not Returned</span>
                <span class="text-gray-400">&rarr;</span>
                <span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">Returned</span>
              </span>
            </div>
            <p class="text-gray-500 text-xs mt-1.5" style="font-family: 'DM Sans', sans-serif">Type: {{ itemType }}</p>
          </div>

          <!-- Warning -->
          <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <svg class="text-amber-600 w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-amber-800 text-xs leading-normal" style="font-family: 'DM Sans', sans-serif">
              Once marked as <strong>Returned</strong>, this action cannot be reversed. The status will be permanently locked.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2.5">
            <button
              (click)="onClose()"
              class="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-150"
              style="font-family: 'DM Sans', sans-serif"
            >
              Cancel
            </button>
            <button
              (click)="onConfirm()"
              class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all duration-150 shadow-sm flex items-center justify-center gap-1.5"
              style="font-family: 'DM Sans', sans-serif"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReturnConfirmModalComponent implements OnInit {
  @Input() itemName = '';
  @Input() itemId = '';
  @Input() itemType = 'Found Item';

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  visible = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.visible = true;
      this.cdr.markForCheck();
    });
  }

  onClose(): void {
    this.visible = false;
    setTimeout(() => this.close.emit(), 250);
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
