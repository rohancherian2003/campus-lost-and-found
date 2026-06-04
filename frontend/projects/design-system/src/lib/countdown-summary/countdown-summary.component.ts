import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SummaryCard {
  label: string;
  value: number;
  cls: string;
  txt: string;
  dot: string;
}

@Component({
  selector: 'ds-countdown-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div *ngFor="let card of cards" class="border rounded-xl p-4 flex items-center gap-3 shadow-sm" [ngClass]="card.cls">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="card.dot"></span>
        <div>
          <p class="text-2xl font-bold" [ngClass]="card.txt" style="font-family: 'Outfit', sans-serif">{{ card.value }}</p>
          <p class="text-[10px] font-semibold" [ngClass]="card.txt" style="font-family: 'DM Sans', sans-serif">{{ card.label }}</p>
        </div>
      </div>
    </div>
  `
})
export class CountdownSummaryComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() dateField = 'dateFound';

  cards: SummaryCard[] = [];

  ngOnChanges(): void {
    const notReturned = this.items.filter(i => i.status === 'Not Returned');
    const stats = notReturned.reduce(
      (acc, item) => {
        const dateStr = item[this.dateField];
        if (dateStr) {
          const status = this.getCountdownStatus(dateStr);
          acc[status]++;
        }
        return acc;
      },
      { active: 0, expiring: 0, last10: 0, expired: 0 }
    );

    this.cards = [
      { label: 'Total Unclaimed', value: notReturned.length, cls: 'bg-cyan-50 border-cyan-200', txt: 'text-cyan-700', dot: 'bg-cyan-400' },
      { label: 'Expiring in 30 Days', value: stats.expiring + stats.last10, cls: 'bg-amber-50 border-amber-200', txt: 'text-amber-700', dot: 'bg-amber-400' },
      { label: 'Last 10 Days', value: stats.last10, cls: 'bg-red-50 border-red-200', txt: 'text-red-700', dot: 'bg-red-500' },
      { label: 'Expired – Awaiting Removal', value: stats.expired, cls: 'bg-gray-50 border-gray-200', txt: 'text-gray-600', dot: 'bg-gray-400' },
    ];
  }

  private getCountdownStatus(dateStr: string): 'active' | 'expiring' | 'last10' | 'expired' {
    const reported = this.parseDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysElapsed = Math.max(0, Math.floor((today.getTime() - reported.getTime()) / 86400000));
    const daysRemaining = Math.max(0, 60 - daysElapsed);

    if (daysElapsed >= 60) return 'expired';
    if (daysRemaining <= 10) return 'last10';
    if (daysRemaining <= 30) return 'expiring';
    return 'active';
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
