import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { TiposVehiculoRoutingModule } from './tipos-vehiculo-routing.module';
import { TiposVehiculoListComponent } from './components/tipos-vehiculo-list.component';
import { TiposVehiculoService } from './services/tipos-vehiculo.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    TiposVehiculoRoutingModule,
    TiposVehiculoListComponent // Standalone component
  ],
  providers: [
    TiposVehiculoService
  ]
})
export class TiposVehiculoModule { }
