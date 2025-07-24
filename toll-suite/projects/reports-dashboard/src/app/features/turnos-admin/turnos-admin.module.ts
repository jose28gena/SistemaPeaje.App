import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Componentes que vamos a crear
import { TurnosAdminComponent } from './components/turnos-admin.component';
import { TurnoTemplatesComponent } from './components/turno-templates/turno-templates.component';
import { TurnosDashboardComponent } from './components/turnos-dashboard/turnos-dashboard.component';
import { TurnoAsignacionesComponent } from './components/turno-asignaciones/turno-asignaciones.component';
import { TurnoEventosComponent } from './components/turno-eventos/turno-eventos.component';

const routes: Routes = [
  {
    path: '',
    component: TurnosAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TurnosDashboardComponent },
      { path: 'templates', component: TurnoTemplatesComponent },
      { path: 'asignaciones', component: TurnoAsignacionesComponent },
      { path: 'eventos', component: TurnoEventosComponent }
    ]
  }
];

@NgModule({
  declarations: [
    TurnosAdminComponent,
    TurnoTemplatesComponent,
    TurnosDashboardComponent,
    TurnoAsignacionesComponent,
    TurnoEventosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    DatePipe,
    CurrencyPipe
  ]
})
export class TurnosAdminModule { }
