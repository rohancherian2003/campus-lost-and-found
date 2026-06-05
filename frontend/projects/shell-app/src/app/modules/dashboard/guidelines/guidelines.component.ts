import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guidelines.component.html',
  styleUrls: ['./guidelines.component.css']
})
export class GuidelinesComponent {
  active: 'lost' | 'found' = 'lost';

  lostRules = [
    'Verify student ID before releasing any item to ensure proper ownership.',
    'The claimant should correctly describe the item appearance, brand/model, and any special marks or accessories.',
    'For electronic items, students may be asked to unlock the device or verify ownership.',
    'Admin should verify matching details from the Lost Item report before returning the item.',
    'If ownership is unclear, the item should remain under admin review until verification is complete.',
    'Items unclaimed after 6 months will be donated or disposed of responsibly.'
  ];

  foundRules = [
    'Food items, damaged items, or unsafe materials should not be accepted.',
    'Every found item must be entered into the system immediately after submission.',
    'Admin must collect complete details of the found item: item name, color/brand, location found, and date & time found.',
    'Ensure storage areas are locked and secure at all times.'
  ];

  setActive(tab: 'lost' | 'found'): void {
    this.active = tab;
  }
}
