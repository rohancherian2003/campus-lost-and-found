import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from 'shared-lib';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'browse',
    redirectTo: 'browse/found',
    pathMatch: 'full'
  },
  {
    path: 'browse/:type',
    loadComponent: () => import('./browse/browse.component').then(m => m.BrowseComponent)
  },
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./modules/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'lost-items',
        pathMatch: 'full'
      },
      {
        path: 'lost-items',
        loadComponent: () => import('./modules/lost-items/lost-items.component').then(m => m.LostItemsComponent)
      },
      {
        path: 'found-items',
        loadComponent: () => import('./modules/found-items/found-items.component').then(m => m.FoundItemsComponent)
      },
      {
        path: 'expired-items',
        loadComponent: () => import('./modules/found-items/found-items.component').then(m => m.FoundItemsComponent)
      },
      {
        path: 'report',
        redirectTo: 'reports',
        pathMatch: 'full'
      },
      {
        path: 'reports',
        loadComponent: () => import('./modules/found-items/found-items.component').then(m => m.FoundItemsComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'guidelines',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
