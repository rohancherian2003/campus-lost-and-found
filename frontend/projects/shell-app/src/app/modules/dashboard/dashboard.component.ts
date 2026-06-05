import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { HistoryComponent } from './history/history.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HistoryComponent, GuidelinesComponent, SettingsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeView: 'history' | 'guidelines' | 'settings' = 'history';
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateView(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const navEnd = event as NavigationEnd;
      this.updateView(navEnd.urlAfterRedirects || navEnd.url);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(url: string): void {
    if (url.includes('guidelines')) {
      this.activeView = 'guidelines';
    } else if (url.includes('settings')) {
      this.activeView = 'settings';
    } else {
      this.activeView = 'history';
    }
  }
}
