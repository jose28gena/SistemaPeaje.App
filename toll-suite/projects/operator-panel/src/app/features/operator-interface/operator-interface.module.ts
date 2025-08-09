import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OperatorInterfaceComponent } from './operator-interface.component';
import { API_BASE_URL } from '@toll-suite/data-access';
import { environment } from '../../../environments/environment';

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
  ],
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiUrl }
  ]
})
export class OperatorInterfaceModule { }
