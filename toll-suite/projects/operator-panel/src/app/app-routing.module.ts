import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/operator',
    pathMatch: 'full'
  },
  {
    path: 'operator',
    loadChildren: () => import('./features/operator-interface/operator-interface.module').then(m => m.OperatorInterfaceModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'lane-control',
    loadChildren: () => import('./features/lane-control/lane-control.module').then(m => m.LaneControlModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '**',
    redirectTo: '/operator'
  }
];
