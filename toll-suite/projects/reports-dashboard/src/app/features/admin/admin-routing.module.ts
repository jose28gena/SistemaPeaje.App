import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { EstacionesComponent } from './pages/estaciones/estaciones.component';
import { CarrilesComponent } from './pages/carriles/carriles.component';
import { TiposVehiculoComponent } from './pages/tipos-vehiculo/tipos-vehiculo.component';
// Import standalone component
import { TiposPagoComponent } from './pages/tipos-pago/tipos-pago.component';
import { TiposClienteComponent } from './pages/tipos-cliente/tipos-cliente.component';
import { TarifasComponent } from './pages/tarifas/tarifas.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { TarjetasRfidComponent } from './pages/tarjetas-rfid/tarjetas-rfid.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { TestComponent } from './pages/test/test.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'station-monitoring', pathMatch: 'full' },
      { path: 'station-monitoring', loadChildren: () => import('./components/station-monitoring.module').then(m => m.StationMonitoringModule) },
      { path: 'test', component: TestComponent },
      { path: 'estaciones', component: EstacionesComponent },
      { path: 'carriles', component: CarrilesComponent },
      { path: 'tipos-vehiculo', component: TiposVehiculoComponent },
      { path: 'tipos-pago', component: TiposPagoComponent },
      { path: 'tipos-cliente', component: TiposClienteComponent },
      { path: 'tarifas', component: TarifasComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'tarjetas-rfid', component: TarjetasRfidComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'turnos', loadChildren: () => import('./pages/turnos/turnos.module').then(m => m.TurnosModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
