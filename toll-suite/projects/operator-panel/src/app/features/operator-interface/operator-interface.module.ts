import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OperatorInterfaceComponent } from './operator-interface.component';

const routes: Routes = [
  {
    path: '',
    component: OperatorInterfaceComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    OperatorInterfaceComponent
  ]
})
export class OperatorInterfaceModule { }
