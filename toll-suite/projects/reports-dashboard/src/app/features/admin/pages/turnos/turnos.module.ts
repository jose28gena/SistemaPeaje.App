import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TurnosComponent } from './turnos.component';
import { AperturaTurnoComponent } from './components/apertura-turno.component';
import { CierreTurnoComponent } from './components/cierre-turno.component';

@NgModule({
  declarations: [
    TurnosComponent,
    AperturaTurnoComponent,
    CierreTurnoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TurnosComponent
      }
    ])
  ],
  exports: [
    TurnosComponent,
    AperturaTurnoComponent,
    CierreTurnoComponent
  ]
})
export class TurnosModule { }
