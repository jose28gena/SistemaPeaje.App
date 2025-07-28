import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TiposVehiculoListComponent } from './components/tipos-vehiculo-list.component';
import { TiposVehiculoService } from './services/tipos-vehiculo.service';

@NgModule({
  declarations: [
    TiposVehiculoListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TiposVehiculoListComponent
      }
    ])
  ],
  providers: [
    TiposVehiculoService
  ]
})
export class TiposVehiculoModule { }
