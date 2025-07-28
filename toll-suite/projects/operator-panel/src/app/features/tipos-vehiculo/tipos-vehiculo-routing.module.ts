import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiposVehiculoListComponent } from './components/tipos-vehiculo-list.component';

const routes: Routes = [
  {
    path: '',
    component: TiposVehiculoListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiposVehiculoRoutingModule { }
