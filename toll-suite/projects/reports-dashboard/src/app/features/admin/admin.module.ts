import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { API_BASE_URL } from '@toll-suite/data-access';

import { AdminRoutingModule } from './admin-routing.module';
import { environment } from '../../../environments/environment';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

// Shared Components
import { DataTableComponent } from './components/shared/data-table/data-table.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';
import { EstacionFormComponent } from './components/shared/estacion-form/estacion-form.component';
import { EmpleadoFormComponent } from './components/shared/empleado-form/empleado-form.component';
import { ClienteFormComponent } from './components/shared/cliente-form/cliente-form.component';
import { TarjetaFormComponent } from './components/shared/tarjeta-form/tarjeta-form.component';
import { CarrilFormComponent } from './components/shared/carril-form/carril-form.component';

// Catalog Pages
import { EstacionesComponent } from './pages/estaciones/estaciones.component';
import { CarrilesComponent } from './pages/carriles/carriles.component';
import { TiposVehiculoComponent } from './pages/tipos-vehiculo/tipos-vehiculo.component';
import { TiposPagoComponent } from './pages/tipos-pago/tipos-pago.component';
import { TiposClienteComponent } from './pages/tipos-cliente/tipos-cliente.component';
import { TarifasComponent } from './pages/tarifas/tarifas.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { TarjetasRfidComponent } from './pages/tarjetas-rfid/tarjetas-rfid.component';
import { TarjetasRfidNewComponent } from './pages/tarjetas-rfid/tarjetas-rfid-new.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { TestComponent } from './pages/test/test.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    
    // Shared Components
    DataTableComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    EstacionFormComponent,
    EmpleadoFormComponent,
    ClienteFormComponent,
    TarjetaFormComponent,
    CarrilFormComponent,
    
    // Catalog Pages
    EstacionesComponent,
    CarrilesComponent,
    TiposVehiculoComponent,
    TiposPagoComponent,
    TiposClienteComponent,
    TarifasComponent,
    ClientesComponent,
    EmpleadosComponent,
    TarjetasRfidComponent,
    TarjetasRfidNewComponent,
    UsuariosComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    AdminRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiUrl }
  ]
})
export class AdminModule { }
