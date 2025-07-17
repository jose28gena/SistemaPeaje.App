import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TarifasComponent } from './tarifas.component';
import { TarifaFormComponent } from './components/tarifa-form/tarifa-form.component';

@NgModule({
  declarations: [
    TarifasComponent,
    TarifaFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    TarifasComponent
  ]
})
export class TarifasModule { }
