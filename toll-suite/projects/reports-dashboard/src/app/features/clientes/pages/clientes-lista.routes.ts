import { Routes } from '@angular/router';
import { ClientesListaComponent } from './clientes-lista.component';

export const CLIENTES_LISTA_ROUTES: Routes = [
  {
    path: '',
    component: ClientesListaComponent,
    data: {
      title: 'Lista de Clientes',
      breadcrumb: 'Lista'
    }
  }
];
