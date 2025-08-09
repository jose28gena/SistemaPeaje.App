import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { 
  ConfiguracionTiposPagoService,
  TiposPagoServiceExtendido,
  ConfiguracionTipoPago,
  TipoPagoConConfiguracion,
  CreateConfiguracionTipoPagoDto,
  UpdateConfiguracionTipoPagoDto,
  CalcularMontoRequest,
  CalcularMontoResponse,
  EstadisticasTipoPago,
  MonedasSoportadas,
  SIMBOLOS_MONEDA,
  LIMITES_DEFECTO
} from '@data-access';

// Import statements commented temporarily until dialog components are implemented
// import { ConfiguracionTipoPagoDialogComponent } from './configuracion-tipo-pago-dialog.component';
// import { CalculadoraMontoDialogComponent } from './calculadora-monto-dialog.component';

@Component({
  selector: 'app-tipos-pago',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule
  ],
  template: `
    <div class="tipos-pago-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>payment</mat-icon>
            Configuración de Tipos de Pago
          </h1>
          <p>Gestiona los métodos de pago activos y sus parámetros de configuración</p>
        </div>
        
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="inicializarTipos()">
            <mat-icon>settings_backup_restore</mat-icon>
            Inicializar Tipos
          </button>
          
          <button mat-raised-button color="accent" (click)="abrirCalculadora()">
            <mat-icon>calculate</mat-icon>
            Calculadora
          </button>
          
          <button mat-raised-button (click)="exportarConfiguraciones()">
            <mat-icon>download</mat-icon>
            Exportar
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="estadisticas-grid" *ngIf="estadisticas">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon color="primary">payment</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ estadisticas.totalTipos }}</div>
                <div class="stat-label">Total de Tipos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon color="accent">check_circle</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ estadisticas.tiposActivos }}</div>
                <div class="stat-label">Tipos Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon color="warn">trending_up</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formatearMonto(estadisticas.montoTotalProcesado) }}</div>
                <div class="stat-label">Monto Total</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon color="success">savings</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formatearMonto(estadisticas.comisionesTotales) }}</div>
                <div class="stat-label">Comisiones</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs principales -->
      <mat-tab-group class="main-tabs">
        <!-- Tab: Configuraciones -->
        <mat-tab label="Configuraciones">
          <div class="tab-content">
            <!-- Filtros -->
            <div class="filtros-section">
              <mat-card>
                <mat-card-content>
                  <form [formGroup]="filtrosForm" class="filtros-form">
                    <mat-form-field>
                      <mat-label>Mostrar</mat-label>
                      <mat-select formControlName="soloActivos">
                        <mat-option [value]="null">Todos</mat-option>
                        <mat-option [value]="true">Solo Activos</mat-option>
                        <mat-option [value]="false">Solo Inactivos</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Moneda</mat-label>
                      <mat-select formControlName="moneda">
                        <mat-option [value]="null">Todas</mat-option>
                        <mat-option *ngFor="let moneda of monedas" [value]="moneda">
                          {{ SIMBOLOS_MONEDA[moneda] }} {{ moneda }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <button mat-raised-button color="primary" (click)="aplicarFiltros()">
                      <mat-icon>filter_list</mat-icon>
                      Filtrar
                    </button>

                    <button mat-button (click)="limpiarFiltros()">
                      <mat-icon>clear</mat-icon>
                      Limpiar
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Tabla de configuraciones -->
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Configuraciones de Tipos de Pago</mat-card-title>
                <div class="card-actions">
                  <button mat-icon-button (click)="cargarDatos()" matTooltip="Actualizar">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </div>
              </mat-card-header>

              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="configuraciones" class="configuraciones-table">
                    <!-- Columna: Estado -->
                    <ng-container matColumnDef="estado">
                      <th mat-header-cell *matHeaderCellDef>Estado</th>
                      <td mat-cell *matCellDef="let config">
                        <mat-slide-toggle 
                          [checked]="config.estaActivo"
                          (change)="toggleActivacion(config, $event.checked)"
                          [color]="config.estaActivo ? 'primary' : 'warn'">
                        </mat-slide-toggle>
                      </td>
                    </ng-container>

                    <!-- Columna: Tipo de Pago -->
                    <ng-container matColumnDef="tipoPago">
                      <th mat-header-cell *matHeaderCellDef>Tipo de Pago</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="tipo-pago-cell">
                          <strong>{{ config.tipoPagoNombre || 'Sin nombre' }}</strong>
                          <mat-chip-set>
                            <mat-chip [color]="config.estaActivo ? 'primary' : 'warn'" selected>
                              {{ config.estaActivo ? 'Activo' : 'Inactivo' }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Moneda -->
                    <ng-container matColumnDef="moneda">
                      <th mat-header-cell *matHeaderCellDef>Moneda</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="moneda-cell">
                          <span class="simbolo">{{ config.simboloMoneda }}</span>
                          <span class="codigo">{{ config.moneda }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Límites -->
                    <ng-container matColumnDef="limites">
                      <th mat-header-cell *matHeaderCellDef>Límites</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="limites-cell">
                          <div class="limite-item">
                            <small>Transacción:</small>
                            <strong>{{ formatearMonto(config.limiteTransaccion || 0, config.simboloMoneda) }}</strong>
                          </div>
                          <div class="limite-item">
                            <small>Diario:</small>
                            <strong>{{ formatearMonto(config.limiteDiario || 0, config.simboloMoneda) }}</strong>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Comisiones -->
                    <ng-container matColumnDef="comisiones">
                      <th mat-header-cell *matHeaderCellDef>Comisiones</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="comisiones-cell">
                          <div class="comision-item" *ngIf="config.comisionPorcentaje > 0">
                            <small>Porcentual:</small>
                            <strong>{{ config.comisionPorcentaje }}%</strong>
                          </div>
                          <div class="comision-item" *ngIf="config.comisionFija > 0">
                            <small>Fija:</small>
                            <strong>{{ formatearMonto(config.comisionFija, config.simboloMoneda) }}</strong>
                          </div>
                          <div class="sin-comision" *ngIf="config.comisionPorcentaje === 0 && config.comisionFija === 0">
                            Sin comisión
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Descuento -->
                    <ng-container matColumnDef="descuento">
                      <th mat-header-cell *matHeaderCellDef>Descuento</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="descuento-cell">
                          <span class="descuento-valor" [class.sin-descuento]="config.descuentoPorDefecto === 0">
                            {{ config.descuentoPorDefecto }}%
                          </span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Validación -->
                    <ng-container matColumnDef="validacion">
                      <th mat-header-cell *matHeaderCellDef>Validación</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="validacion-cell">
                          <mat-icon 
                            [color]="config.requiereValidacionAdicional ? 'warn' : 'primary'"
                            matTooltip="{{ config.requiereValidacionAdicional ? 'Requiere validación adicional' : 'Validación estándar' }}">
                            {{ config.requiereValidacionAdicional ? 'security' : 'verified_user' }}
                          </mat-icon>
                          <small>{{ config.tiempoEsperaSegundos }}s</small>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Columna: Acciones -->
                    <ng-container matColumnDef="acciones">
                      <th mat-header-cell *matHeaderCellDef>Acciones</th>
                      <td mat-cell *matCellDef="let config">
                        <div class="acciones-cell">
                          <button mat-icon-button (click)="editarConfiguracion(config)" matTooltip="Editar">
                            <mat-icon>edit</mat-icon>
                          </button>
                          
                          <button mat-icon-button (click)="duplicarConfiguracion(config)" matTooltip="Duplicar">
                            <mat-icon>content_copy</mat-icon>
                          </button>
                          
                          <button mat-icon-button (click)="calcularMonto(config)" matTooltip="Calcular">
                            <mat-icon>calculate</mat-icon>
                          </button>
                          
                          <button mat-icon-button 
                                  (click)="verHistorial(config)" 
                                  matTooltip="Historial"
                                  color="accent">
                            <mat-icon>history</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="columnasDisplayed"></tr>
                    <tr mat-row *matRowDef="let row; columns: columnasDisplayed;"></tr>
                  </table>
                </div>

                <!-- Sin datos -->
                <div class="sin-datos" *ngIf="configuraciones.length === 0 && !cargando">
                  <mat-icon>info</mat-icon>
                  <h3>No hay configuraciones</h3>
                  <p>Haz clic en "Inicializar Tipos" para crear las configuraciones por defecto</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Nueva Configuración -->
        <mat-tab label="Nueva Configuración">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Crear Nueva Configuración</mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="nuevaConfigForm" (ngSubmit)="crearConfiguracion()">
                  <div class="form-grid">
                    <!-- Tipo de Pago -->
                    <mat-form-field>
                      <mat-label>Tipo de Pago</mat-label>
                      <mat-select formControlName="tipoPagoId" required>
                        <mat-option *ngFor="let tipo of tiposPagoDisponibles" [value]="tipo.id">
                          {{ tipo.nombre }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="nuevaConfigForm.get('tipoPagoId')?.hasError('required')">
                        Selecciona un tipo de pago
                      </mat-error>
                    </mat-form-field>

                    <!-- Moneda -->
                    <mat-form-field>
                      <mat-label>Moneda</mat-label>
                      <mat-select formControlName="moneda" required>
                        <mat-option *ngFor="let moneda of monedas" [value]="moneda">
                          {{ SIMBOLOS_MONEDA[moneda] }} {{ moneda }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <!-- Símbolo de Moneda -->
                    <mat-form-field>
                      <mat-label>Símbolo de Moneda</mat-label>
                      <input matInput formControlName="simboloMoneda" required>
                    </mat-form-field>

                    <!-- Límite Diario -->
                    <mat-form-field>
                      <mat-label>Límite Diario</mat-label>
                      <input matInput type="number" formControlName="limiteDiario" min="0">
                    </mat-form-field>

                    <!-- Límite Transacción -->
                    <mat-form-field>
                      <mat-label>Límite por Transacción</mat-label>
                      <input matInput type="number" formControlName="limiteTransaccion" min="0">
                    </mat-form-field>

                    <!-- Comisión Porcentaje -->
                    <mat-form-field>
                      <mat-label>Comisión (%)</mat-label>
                      <input matInput type="number" formControlName="comisionPorcentaje" min="0" max="100" step="0.1">
                    </mat-form-field>

                    <!-- Comisión Fija -->
                    <mat-form-field>
                      <mat-label>Comisión Fija</mat-label>
                      <input matInput type="number" formControlName="comisionFija" min="0" step="0.01">
                    </mat-form-field>

                    <!-- Descuento -->
                    <mat-form-field>
                      <mat-label>Descuento por Defecto (%)</mat-label>
                      <input matInput type="number" formControlName="descuentoPorDefecto" min="0" max="100" step="0.1">
                    </mat-form-field>

                    <!-- Tiempo Espera -->
                    <mat-form-field>
                      <mat-label>Tiempo de Espera (segundos)</mat-label>
                      <input matInput type="number" formControlName="tiempoEsperaSegundos" min="5" max="300">
                    </mat-form-field>
                  </div>

                  <!-- Switches -->
                  <div class="switches-section">
                    <mat-slide-toggle formControlName="estaActivo">
                      Configuración Activa
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="requiereValidacionAdicional">
                      Requiere Validación Adicional
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="permiteTransaccionesParcialeS">
                      Permite Transacciones Parciales
                    </mat-slide-toggle>
                  </div>

                  <!-- Configuración Específica -->
                  <mat-form-field class="full-width">
                    <mat-label>Configuración Específica (JSON)</mat-label>
                    <textarea matInput formControlName="configuracionEspecifica" rows="3" 
                              placeholder='{"ejemplo": "valor", "propiedad": true}'></textarea>
                  </mat-form-field>

                  <!-- Observaciones -->
                  <mat-form-field class="full-width">
                    <mat-label>Observaciones</mat-label>
                    <textarea matInput formControlName="observaciones" rows="2"></textarea>
                  </mat-form-field>

                  <!-- Botones -->
                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="nuevaConfigForm.invalid || creando">
                      <mat-icon>save</mat-icon>
                      {{ creando ? 'Creando...' : 'Crear Configuración' }}
                    </button>

                    <button mat-button type="button" (click)="limpiarFormulario()">
                      <mat-icon>clear</mat-icon>
                      Limpiar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Loading -->
      <mat-progress-bar mode="indeterminate" *ngIf="cargando"></mat-progress-bar>
    </div>
  `,
  styleUrls: ['./tipos-pago.component.scss']
})
export class TiposPagoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Datos
  configuraciones: ConfiguracionTipoPago[] = [];
  tiposPagoDisponibles: any[] = [];
  estadisticas: EstadisticasTipoPago | null = null;
  
  // Estados
  cargando = false;
  creando = false;
  
  // Formularios
  filtrosForm!: FormGroup;
  nuevaConfigForm!: FormGroup;
  
  // Tabla
  columnasDisplayed = ['estado', 'tipoPago', 'moneda', 'limites', 'comisiones', 'descuento', 'validacion', 'acciones'];
  
  // Constantes
  monedas = Object.values(MonedasSoportadas);
  SIMBOLOS_MONEDA = SIMBOLOS_MONEDA;
  LIMITES_DEFECTO = LIMITES_DEFECTO;

  constructor(
    private configuracionService: ConfiguracionTiposPagoService,
    private tiposPagoService: TiposPagoServiceExtendido,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===================================
  // INICIALIZACIÓN
  // ===================================
  
  private initializeForms(): void {
    this.filtrosForm = this.fb.group({
      soloActivos: [null],
      moneda: [null]
    });

    this.nuevaConfigForm = this.fb.group({
      tipoPagoId: ['', Validators.required],
      moneda: ['MXN', Validators.required],
      simboloMoneda: ['$', Validators.required],
      limiteDiario: [null, [Validators.min(0)]],
      limiteTransaccion: [null, [Validators.min(0)]],
      comisionPorcentaje: [0, [Validators.min(0), Validators.max(100)]],
      comisionFija: [0, [Validators.min(0)]],
      estaActivo: [true],
      requiereValidacionAdicional: [false],
      tiempoEsperaSegundos: [30, [Validators.min(5), Validators.max(300)]],
      descuentoPorDefecto: [0, [Validators.min(0), Validators.max(100)]],
      permiteTransaccionesParcialeS: [false],
      configuracionEspecifica: [''],
      observaciones: ['']
    });

    // Auto-actualizar símbolo cuando cambia moneda
    this.nuevaConfigForm.get('moneda')?.valueChanges.subscribe(moneda => {
      if (moneda && SIMBOLOS_MONEDA[moneda as keyof typeof SIMBOLOS_MONEDA]) {
        this.nuevaConfigForm.patchValue({
          simboloMoneda: SIMBOLOS_MONEDA[moneda as keyof typeof SIMBOLOS_MONEDA]
        });
      }
    });
  }

  // ===================================
  // CARGA DE DATOS
  // ===================================
  
  cargarDatos(): void {
    this.cargando = true;
    
    forkJoin({
      configuraciones: this.configuracionService.getConfiguracionesConFiltros(),
      tiposDisponibles: this.tiposPagoService.getTodos(),
      estadisticas: this.configuracionService.getEstadisticas()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.configuraciones = data.configuraciones;
        this.tiposPagoDisponibles = data.tiposDisponibles;
        this.estadisticas = data.estadisticas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.mostrarError('Error al cargar los datos');
        this.cargando = false;
      }
    });
  }

  // ===================================
  // FILTROS
  // ===================================
  
  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    
    this.cargando = true;
    this.configuracionService.getConfiguracionesConFiltros(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configuraciones) => {
          this.configuraciones = configuraciones;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error aplicando filtros:', error);
          this.mostrarError('Error al aplicar filtros');
          this.cargando = false;
        }
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarDatos();
  }

  // ===================================
  // ACCIONES PRINCIPALES
  // ===================================
  
  inicializarTipos(): void {
    this.cargando = true;
    
    forkJoin({
      tipos: this.tiposPagoService.inicializarTiposBasicos(),
      configuraciones: this.configuracionService.inicializarConfiguracionesDefecto()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.mostrarExito('Tipos de pago y configuraciones inicializados correctamente');
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error inicializando tipos:', error);
        this.mostrarError('Error al inicializar tipos de pago');
        this.cargando = false;
      }
    });
  }

  crearConfiguracion(): void {
    if (this.nuevaConfigForm.invalid) return;
    
    this.creando = true;
    const configuracion: CreateConfiguracionTipoPagoDto = this.nuevaConfigForm.value;
    
    this.configuracionService.create(configuracion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mostrarExito('Configuración creada correctamente');
          this.limpiarFormulario();
          this.cargarDatos();
          this.creando = false;
        },
        error: (error) => {
          console.error('Error creando configuración:', error);
          this.mostrarError('Error al crear la configuración');
          this.creando = false;
        }
      });
  }

  editarConfiguracion(configuracion: ConfiguracionTipoPago): void {
    // TODO: Implementar diálogo de edición cuando esté disponible
    console.log('Editar configuración:', configuracion);
    /*
    const dialogRef = this.dialog.open(ConfiguracionTipoPagoDialogComponent, {
      width: '800px',
      data: { configuracion, modoEdicion: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarDatos();
      }
    });
    */
  }

  duplicarConfiguracion(configuracion: ConfiguracionTipoPago): void {
    // Implementar diálogo para seleccionar tipo destino
    this.mostrarInfo('Funcionalidad en desarrollo');
  }

  toggleActivacion(configuracion: ConfiguracionTipoPago, activo: boolean): void {
    this.configuracionService.toggleActivacion(configuracion.id, activo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          configuracion.estaActivo = activo;
          this.mostrarExito(
            activo ? 'Configuración activada' : 'Configuración desactivada'
          );
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          this.mostrarError('Error al cambiar el estado');
        }
      });
  }

  calcularMonto(configuracion: ConfiguracionTipoPago): void {
    // TODO: Implementar diálogo calculadora cuando esté disponible
    console.log('Calcular monto para:', configuracion);
    /*
    const dialogRef = this.dialog.open(CalculadoraMontoDialogComponent, {
      width: '600px',
      data: { configuracion }
    });
    */
  }

  verHistorial(configuracion: ConfiguracionTipoPago): void {
    this.mostrarInfo('Historial en desarrollo');
  }

  abrirCalculadora(): void {
    // TODO: Implementar diálogo calculadora cuando esté disponible
    console.log('Abrir calculadora con configuraciones:', this.configuraciones);
    /*
    const dialogRef = this.dialog.open(CalculadoraMontoDialogComponent, {
      width: '600px',
      data: { configuraciones: this.configuraciones }
    });
    */
  }

  exportarConfiguraciones(): void {
    this.configuracionService.exportarConfiguraciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `configuraciones-tipos-pago-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.mostrarExito('Configuraciones exportadas correctamente');
        },
        error: (error) => {
          console.error('Error exportando:', error);
          this.mostrarError('Error al exportar configuraciones');
        }
      });
  }

  // ===================================
  // UTILIDADES
  // ===================================
  
  limpiarFormulario(): void {
    this.nuevaConfigForm.reset({
      moneda: 'MXN',
      simboloMoneda: '$',
      comisionPorcentaje: 0,
      comisionFija: 0,
      estaActivo: true,
      requiereValidacionAdicional: false,
      tiempoEsperaSegundos: 30,
      descuentoPorDefecto: 0,
      permiteTransaccionesParcialeS: false
    });
  }

  formatearMonto(monto: number, simbolo: string = '$'): string {
    if (!monto) return `${simbolo}0.00`;
    return this.configuracionService.formatearMonto(monto, simbolo);
  }

  // ===================================
  // MENSAJES
  // ===================================
  
  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarInfo(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
