import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';

// Routing
import { ClientesRoutingModule } from './clientes-routing.module';

// Services
import { ClienteService } from './services/cliente.service';

@NgModule({
  declarations: [
    // Los componentes standalone no se declaran aquí
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClientesRoutingModule,
    
    // Angular Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatStepperModule
  ],
  providers: [
    ClienteService
  ]
})
export class ClientesModule { }

/**
 * Módulo de gestión de clientes
 * 
 * Este módulo proporciona funcionalidad completa para la gestión del ciclo de vida
 * de los clientes en el sistema de peaje, incluyendo:
 * 
 * Funcionalidades principales:
 * - Lista y búsqueda de clientes con filtros avanzados
 * - Creación y edición de clientes (personas físicas y morales)
 * - Gestión del proceso KYC (Know Your Customer)
 * - Aprobación y rechazo de documentos
 * - Suspensión y reactivación de cuentas
 * - Gestión de vehículos asociados
 * - Historial de transacciones y facturas
 * - Gestión de recargas y saldos
 * - Configuración de modelo de cuenta (prepago, postpago, crédito)
 * 
 * Componentes:
 * - ClientesListaComponent: Lista principal con filtros y acciones
 * 
 * TODO - Componentes pendientes:
 * - ClienteFormComponent: Formulario de creación/edición
 * - ClienteDetalleComponent: Vista de detalles del cliente
 * - ClienteVehiculosComponent: Gestión de vehículos
 * - ClienteDocumentosComponent: Gestión de documentos KYC
 * - ClienteFacturasComponent: Historial de facturas
 * - ClienteRecargasComponent: Historial de recargas
 * - ClienteEstadoCuentaComponent: Estado de cuenta
 * 
 * Servicios:
 * - ClienteService: Comunicación con API backend
 * 
 * Modelos:
 * - Definidos en models/cliente.models.ts
 * - Interfaces completas para todas las entidades del dominio
 */
