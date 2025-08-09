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
    path: '**',
    redirectTo: '/operator'
  }

];
