import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clientes-lista.component').then(c => c.ClientesListaComponent),
    data: {
      title: 'Gestión de Clientes',
      breadcrumb: 'Clientes'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
