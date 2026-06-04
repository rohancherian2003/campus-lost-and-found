import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-countdown-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-3 pt-3 border-t border-gray-100" [ngClass]="{'opacity-60': isExpired}">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide" style="font-family: 'DM Sans', sans-serif">Claim Period</span>
        <span class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" [ngClass]="[badge.bg, badge.text]">
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="badge.dot"></span>
          {{ badge.label }}
        </span>
      </div>
      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div class="h-full rounded-full" [style.width.%]="pct" [style.background-color]="barColor" style="transition: width 0.4s ease"></div>
      </div>
      <p class="text-[10px] text-gray-400" style="font-family: 'DM Sans', sans-serif">
        {{ isExpired ? '60-Day Limit Reached · Eligible for University Disposal Policy' : daysRemaining + ' / 60 Days Remaining' }}
      </p>
    </div>
  `
})
export class CountdownBarComponent implements OnChanges {
  @Input() dateStr!: string;

  daysRemaining = 60;
  daysElapsed = 0;
  isExpired = false;
  pct = 0;
  barColor = '#22c55e';
  badge = { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' };

  ngOnChanges(): void {
    if (!this.dateStr) return;
    const reported = this.parseDate(this.dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.daysElapsed = Math.max(0, Math.floor((today.getTime() - reported.getTime()) / 86400000));
    this.daysRemaining = Math.max(0, 60 - this.daysElapsed);
    this.isExpired = this.daysElapsed >= 60;
    this.pct = Math.min(100, (this.daysElapsed / 60) * 100);

    if (this.isExpired) {
      this.barColor = '#9ca3af';
      this.badge = { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' };
    } else if (this.daysRemaining <= 10) {
      this.barColor = '#ef4444';
      this.badge = { label: 'Last 10 Days', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
    } else if (this.daysRemaining <= 30) {
      this.barColor = '#f59e0b';
      this.badge = { label: 'Expiring Soon', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' };
    } else {
      this.barColor = '#22c55e';
      this.badge = { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' };
    }
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    if (dateStr.includes('-') || dateStr.includes('T')) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length < 3) {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date(Number(parts[2]), months[parts[1]], Number(parts[0]));
  }
}
