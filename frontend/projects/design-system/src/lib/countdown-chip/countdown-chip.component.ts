import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-countdown-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      [ngClass]="chipClass">
      {{ label }}
    </span>
  `
})
export class CountdownChipComponent implements OnChanges {
  @Input() dateStr!: string;

  label = '🟢 60d';
  chipClass = 'bg-emerald-50 text-emerald-600';

  ngOnChanges(): void {
    if (!this.dateStr) return;
    const reported = this.parseDate(this.dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysElapsed = Math.max(0, Math.floor((today.getTime() - reported.getTime()) / 86400000));
    const daysRemaining = Math.max(0, 60 - daysElapsed);
    const isExpired = daysElapsed >= 60;

    if (isExpired) {
      this.label = '⚫ Expired';
      this.chipClass = 'bg-gray-100 text-gray-500';
    } else if (daysRemaining <= 10) {
      this.label = `🔴 ${daysRemaining}d`;
      this.chipClass = 'bg-red-50 text-red-600';
    } else if (daysRemaining <= 30) {
      this.label = `🟡 ${daysRemaining}d`;
      this.chipClass = 'bg-amber-50 text-amber-600';
    } else {
      this.label = `🟢 ${daysRemaining}d`;
      this.chipClass = 'bg-emerald-50 text-emerald-600';
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
