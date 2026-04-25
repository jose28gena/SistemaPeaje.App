import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ClienteService } from '../services/cliente.service';
import { 
  Cliente, 
  EstadoCliente, 
  TipoPersona, 
  ModeloCuenta 
} from '../models/cliente.models';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="clientes-container">
      <div class="header">
        <div class="title-section">
          <h1>Gestión de Clientes</h1>
          <p>Administre el flujo de vida completo de los clientes</p>
        </div>
        <div class="actions">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="crearNuevoCliente()"
            class="crear-btn">
            <mat-icon>add</mat-icon>
            Nuevo Cliente
          </button>
        </div>
      </div>

      <mat-card class="filtros-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <div class="filtros-row">
              <mat-form-field>
                <mat-label>Buscar</mat-label>
                <input matInput placeholder="Nombre, email, RFC..." formControlName="busqueda">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option value="">Todos</mat-option>
                  <mat-option *ngFor="let estado of estadosCliente" [value]="estado.value">
                    {{estado.label}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Tipo Persona</mat-label>
                <mat-select formControlName="tipoPersona">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="Fisica">Física</mat-option>
                  <mat-option value="Moral">Moral</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-button color="accent" (click)="limpiarFiltros()" type="button">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="estadisticas-row">
        <div class="stat-card">
          <div class="stat-number">{{estadisticas.total || 0}}</div>
          <div class="stat-label">Total Clientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{estadisticas.aprobados || 0}}</div>
          <div class="stat-label">Aprobados</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{estadisticas.enValidacion || 0}}</div>
          <div class="stat-label">En Validación</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{estadisticas.prospectos || 0}}</div>
          <div class="stat-label">Prospectos</div>
        </div>
      </div>

      <mat-card class="tabla-card">
        <mat-card-content>
          <div class="tabla-header">
            <h3>Lista de Clientes</h3>
            <span class="total-registros">{{totalRegistros}} registros</span>
          </div>

          <div class="tabla-container" *ngIf="!cargando; else loadingTemplate">
            <table mat-table [dataSource]="clientes" class="clientes-table">
              
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let cliente">{{cliente.id}}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let cliente">
                  <div class="cliente-info">
                    <div class="cliente-nombre">{{obtenerNombreCompleto(cliente)}}</div>
                    <div class="cliente-email">{{cliente.email}}</div>
                    <div class="cliente-rfc" *ngIf="cliente.rfc">RFC: {{cliente.rfc}}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let cliente">
                  <mat-chip-set>
                    <mat-chip [color]="obtenerColorEstado(cliente.estadoCliente)" selected>
                      {{obtenerLabelEstado(cliente.estadoCliente)}}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="kyc">
                <th mat-header-cell *matHeaderCellDef>KYC</th>
                <td mat-cell *matCellDef="let cliente">
                  <mat-chip-set>
                    <mat-chip [color]="cliente.kycCompletado ? 'primary' : 'warn'" selected>
                      {{cliente.kycCompletado ? 'Completado' : 'Pendiente'}}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let cliente">
                  <div class="acciones-container">
                    <button mat-icon-button color="primary" matTooltip="Ver detalles" (click)="verDetalles(cliente.id)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    
                    <button mat-icon-button color="accent" matTooltip="Editar" (click)="editarCliente(cliente.id)">
                      <mat-icon>edit</mat-icon>
                    </button>

                    <button 
                      mat-icon-button 
                      color="primary"
                      matTooltip="Aprobar KYC"
                      (click)="aprobarKyc(cliente)"
                      *ngIf="cliente.estadoCliente === EstadoCliente.EnValidacion && !cliente.kycCompletado">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasDisplayed"></tr>
              <tr mat-row *matRowDef="let row; columns: columnasDisplayed;" 
                  (click)="verDetalles(row.id)" class="tabla-row clickable"></tr>
            </table>

            <div class="no-data" *ngIf="clientes.length === 0">
              <mat-icon>people_outline</mat-icon>
              <h3>No se encontraron clientes</h3>
              <p>Intente ajustar los filtros o crear un nuevo cliente</p>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Cargando clientes...</p>
            </div>
          </ng-template>

          <mat-paginator 
            [length]="totalRegistros"
            [pageSize]="tamanoPagina"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .clientes-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .title-section h1 {
      margin: 0;
      color: #2c3e50;
    }

    .title-section p {
      margin: 5px 0 0 0;
      color: #7f8c8d;
    }

    .filtros-card {
      margin-bottom: 20px;
    }

    .filtros-form {
      width: 100%;
    }

    .filtros-row {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filtros-row mat-form-field {
      min-width: 200px;
    }

    .estadisticas-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #3498db;
    }

    .stat-label {
      color: #7f8c8d;
      margin-top: 5px;
    }

    .tabla-card {
      background: white;
    }

    .tabla-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .tabla-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .total-registros {
      color: #7f8c8d;
    }

    .clientes-table {
      width: 100%;
    }

    .cliente-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cliente-nombre {
      font-weight: 500;
      color: #2c3e50;
    }

    .cliente-email {
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .cliente-rfc {
      font-size: 0.8rem;
      color: #95a5a6;
    }

    .acciones-container {
      display: flex;
      gap: 5px;
    }

    .tabla-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .tabla-row:hover {
      background-color: #f8f9fa;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #7f8c8d;
    }

    .no-data mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 10px;
    }

    .loading-container {
      text-align: center;
      padding: 40px 20px;
      color: #7f8c8d;
    }

    .clickable {
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .filtros-row {
        flex-direction: column;
        align-items: stretch;
      }

      .estadisticas-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ClientesListaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  clientes: Cliente[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  tamanoPagina = 10;
  cargando = false;

  // Exposer el enum para usar en el template
  EstadoCliente = EstadoCliente;

  estadisticas = {
    total: 0,
    aprobados: 0,
    enValidacion: 0,
    prospectos: 0
  };

  filtrosForm: FormGroup;
  
  columnasDisplayed: string[] = [
    'id', 
    'nombre', 
    'estado', 
    'kyc', 
    'acciones'
  ];

  estadosCliente = [
    { value: 'Prospecto', label: 'Prospecto' },
    { value: 'EnValidacion', label: 'En Validación' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'Suspendido', label: 'Suspendido' },
    { value: 'Cerrado', label: 'Cerrado' },
    { value: 'Archivado', label: 'Archivado' }
  ];

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      estado: [''],
      tipoPersona: [''],
      modeloCuenta: [''],
      kycCompletado: ['']
    });
  }

  ngOnInit(): void {
    this.configurarFiltros();
    this.cargarClientes();
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarFiltros(): void {
    this.filtrosForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarClientes();
      });
  }

  cargarClientes(): void {
    this.cargando = true;
    
    // Simular datos mientras no tengamos el servicio funcionando
    setTimeout(() => {
      this.clientes = [
        {
          id: 1,
          nombre: 'Juan',
          apellidoPaterno: 'Pérez',
          apellidoMaterno: 'García',
          email: 'juan.perez@email.com',
          rfc: 'PEGJ800101ABC',
          tipoPersona: TipoPersona.Fisica,
          estadoCliente: EstadoCliente.Aprobado,
          kycCompletado: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          razonSocial: undefined,
          telefono: '+52 555 123 4567',
          direccion: 'Calle Principal 123',
          modeloCuenta: ModeloCuenta.Prepago,
          activo: true
        },
        {
          id: 2,
          nombre: 'Empresa',
          apellidoPaterno: undefined,
          apellidoMaterno: undefined,
          email: 'contacto@empresa.com',
          rfc: 'EMP010101XYZ',
          tipoPersona: TipoPersona.Moral,
          estadoCliente: EstadoCliente.EnValidacion,
          kycCompletado: false,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          razonSocial: 'Empresa de Transportes S.A. de C.V.',
          telefono: '+52 555 987 6543',
          direccion: 'Av. Industrial 456',
          modeloCuenta: ModeloCuenta.Credito,
          activo: true
        }
      ];
      this.totalRegistros = this.clientes.length;
      this.cargando = false;
    }, 1000);

    // TODO: Reemplazar con llamada real al servicio
    /*
    const filtros = this.filtrosForm.value;
    this.clienteService.listarClientes(
      filtros.estado || undefined,
      filtros.tipoPersona || undefined,
      filtros.modeloCuenta || undefined,
      filtros.kycCompletado || undefined,
      this.paginaActual,
      this.tamanoPagina
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.clientes = response.clientes;
        this.totalRegistros = response.total;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.cargando = false;
      }
    });
    */
  }

  private cargarEstadisticas(): void {
    // Simular estadísticas
    this.estadisticas = {
      total: 150,
      aprobados: 120,
      enValidacion: 20,
      prospectos: 10
    };

    // TODO: Reemplazar con llamada real al servicio
    /*
    this.clienteService.obtenerResumenDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.estadisticas = stats;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
    */
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex + 1;
    this.tamanoPagina = event.pageSize;
    this.cargarClientes();
  }

  crearNuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  verDetalles(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  editarCliente(id: number): void {
    this.router.navigate(['/clientes', id, 'editar']);
  }

  aprobarKyc(cliente: Cliente): void {
    console.log('Aprobar KYC para cliente:', cliente.id);
    // TODO: Implementar lógica de aprobación KYC
  }

  obtenerNombreCompleto(cliente: Cliente): string {
    if (cliente.tipoPersona === TipoPersona.Moral) {
      return cliente.razonSocial || cliente.nombre;
    }
    
    let nombre = cliente.nombre;
    if (cliente.apellidoPaterno) {
      nombre += ' ' + cliente.apellidoPaterno;
    }
    if (cliente.apellidoMaterno) {
      nombre += ' ' + cliente.apellidoMaterno;
    }
    return nombre;
  }

  obtenerColorEstado(estado: EstadoCliente): string {
    switch (estado) {
      case EstadoCliente.Prospecto:
        return 'accent';
      case EstadoCliente.EnValidacion:
        return 'warn';
      case EstadoCliente.Aprobado:
        return 'primary';
      case EstadoCliente.Suspendido:
        return 'warn';
      default:
        return '';
    }
  }

  obtenerLabelEstado(estado: EstadoCliente): string {
    switch (estado) {
      case EstadoCliente.Prospecto:
        return 'Prospecto';
      case EstadoCliente.EnValidacion:
        return 'En Validación';
      case EstadoCliente.Aprobado:
        return 'Aprobado';
      case EstadoCliente.Suspendido:
        return 'Suspendido';
      case EstadoCliente.Cerrado:
        return 'Cerrado';
      case EstadoCliente.Archivado:
        return 'Archivado';
      default:
        return estado;
    }
  }
}
