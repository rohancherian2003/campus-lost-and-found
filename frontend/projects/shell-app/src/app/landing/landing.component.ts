import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService, AuthService, OverviewStats } from 'shared-lib';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  stats: OverviewStats = {
    total: 32,
    lost: 16,
    found: 16,
    returned: 13,
    lostPercentage: 50,
    foundPercentage: 50,
    returnRate: 41
  };

  constructor(
    private router: Router,
    private itemService: ItemService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.itemService.getOverviewStats().subscribe({
      next: (res) => {
        if (res) {
          this.stats = res;
        }
      },
      error: () => {
        // Fallback to defaults on error (e.g. backend not seeded yet)
      }
    });
  }

  getDashArray(pct: number): string {
    const r = 22;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `${dash} ${circ}`;
  }

  navigateToLostBrowse(): void {
    this.router.navigate(['/browse/lost']);
  }

  navigateToFoundBrowse(): void {
    this.router.navigate(['/browse/found']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/admin/lost-items']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
