import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AuthGuard, NoAuthGuard } from 'shared-lib';
import { environment } from '../environments/environment';

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
    loadComponent: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.authApp,
      exposedModule: './Component'
    }).then(m => m.AppComponent)
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
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.lostItemsApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'found-items',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.foundItemsApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'expired-items',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.foundItemsApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'report',
        redirectTo: 'reports',
        pathMatch: 'full'
      },
      {
        path: 'reports',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.foundItemsApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'history',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.dashboardApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'guidelines',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.dashboardApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      },
      {
        path: 'settings',
        loadComponent: () => loadRemoteModule({
          type: 'module',
          remoteEntry: environment.remotes.dashboardApp,
          exposedModule: './Component'
        }).then(m => m.AppComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
