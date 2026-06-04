import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-logout-modal',
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
        class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center text-center"
      >
        <!-- Icon -->
        <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg class="text-red-500 w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Title -->
        <h2
          class="text-gray-900 mb-2"
          style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700"
        >
          Confirm Logout
        </h2>

        <!-- Message -->
        <p
          class="text-gray-500 text-sm leading-relaxed mb-7"
          style="font-family: 'DM Sans', sans-serif"
        >
          Are you sure you want to logout from <span class="font-semibold text-gray-700">KJU Lost and Found</span>?
        </p>

        <!-- Buttons -->
        <div class="flex gap-3 w-full">
          <button
            (click)="onClose()"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-150"
            style="font-family: 'DM Sans', sans-serif"
          >
            Cancel
          </button>
          <button
            (click)="onConfirm()"
            class="flex-1 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800 active:bg-red-900 transition-all duration-150 shadow-sm"
            style="font-family: 'DM Sans', sans-serif"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  `
})
export class LogoutModalComponent implements OnInit {
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
