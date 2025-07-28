import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  TurnosService,
  Turno, 
  TurnoEstado, 
  CreateTurnoDto, 
  FinalizarTurnoDto 
} from '@toll-suite/data-access';

@Component({
  selector: 'app-turno-operaciones',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i class="fas fa-clock me-2"></i>
              Operaciones de Turnos
            </h2>
            <div class="btn-group">
              <button 
                class="btn btn-primary" 
                (click)="abrirModalApertura()"
                [disabled]="turnoActivo">
                <i class="fas fa-play me-2"></i>
                Abrir Turno
              </button>
              <button 
                class="btn btn-danger" 
                (click)="abrirModalCierre()"
                [disabled]="!turnoActivo">
                <i class="fas fa-stop me-2"></i>
                Cerrar Turno
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Turno Activo -->
      <div class="row" *ngIf="turnoActivo">
        <div class="col-12">
          <div class="card border-success">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-circle me-2 blink"></i>
                Turno Activo
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <strong>Empleado:</strong><br>
                  <span class="text-primary">{{ turnoActivo.empleado?.nombre || 'N/A' }}</span>
                </div>
                <div class="col-md-3">
                  <strong>Estación:</strong><br>
                  <span class="text-info">{{ turnoActivo.estacion?.nombre || 'N/A' }}</span>
                </div>
                <div class="col-md-3">
                  <strong>Hora Inicio:</strong><br>
                  <span class="text-warning">{{ turnoActivo.horaInicio | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="col-md-3">
                  <strong>Duración:</strong><br>
                  <span class="text-success">{{ getDuracionTurno(turnoActivo) }}</span>
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-4">
                  <strong>Total Recaudado:</strong><br>
                  <span class="h5 text-success">{{ turnoActivo.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="col-md-4">
                  <strong>Estado:</strong><br>
                  <span class="badge bg-success">{{ turnoActivo.estado }}</span>
                </div>
                <div class="col-md-4">
                  <strong>Template:</strong><br>
                  <span>{{ turnoActivo.turnoTemplate?.nombre || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Turnos Recientes -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-history me-2"></i>
                Turnos Recientes
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Empleado</th>
                      <th>Estación</th>
                      <th>Fecha</th>
                      <th>Duración</th>
                      <th>Recaudado</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let turno of turnosRecientes">
                      <td>{{ turno.id }}</td>
                      <td>{{ turno.empleado?.nombre || 'N/A' }}</td>
                      <td>{{ turno.estacion?.nombre || 'N/A' }}</td>
                      <td>{{ turno.fechaTurno | date:'dd/MM/yyyy' }}</td>
                      <td>{{ turno.duracionReal ? (turno.duracionReal + ' hrs') : 'N/A' }}</td>
                      <td>{{ turno.totalRecaudado | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadgeClass(turno.estado)">
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td>
                        <button 
                          class="btn btn-sm btn-outline-primary me-1"
                          (click)="verDetalleTurno(turno)">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-secondary"
                          (click)="imprimirReporte(turno)">
                          <i class="fas fa-print"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Apertura de Turno -->
    <div class="modal fade" id="modalApertura" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-play me-2"></i>
              Apertura de Turno
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="aperturaForm" (ngSubmit)="abrirTurno()">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Template de Turno *</label>
                    <select 
                      class="form-select" 
                      formControlName="turnoTemplateId"
                      required>
                      <option value="">Seleccionar template...</option>
                      <option 
                        *ngFor="let template of templates" 
                        [value]="template.id">
                        {{ template.nombre }} ({{ template.horaInicio }} - {{ template.horaFin }})
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Empleado *</label>
                    <select 
                      class="form-select" 
                      formControlName="empleadoId"
                      required>
                      <option value="">Seleccionar empleado...</option>
                      <option 
                        *ngFor="let empleado of empleados" 
                        [value]="empleado.id">
                        {{ empleado.nombre }} - {{ empleado.codigo }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Estación *</label>
                    <select 
                      class="form-select" 
                      formControlName="estacionId"
                      required>
                      <option value="">Seleccionar estación...</option>
                      <option 
                        *ngFor="let estacion of estaciones" 
                        [value]="estacion.id">
                        {{ estacion.nombre }} - {{ estacion.ubicacion }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Saldo Inicial de Caja *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="montoInicialCaja"
                        step="0.01"
                        min="0"
                        required>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Observaciones</label>
                    <textarea 
                      class="form-control" 
                      formControlName="observaciones"
                      rows="3"
                      placeholder="Observaciones o notas adicionales..."></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="aperturaForm.invalid || procesando">
                <i class="fas fa-play me-2"></i>
                {{ procesando ? 'Abriendo...' : 'Abrir Turno' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Cierre de Turno -->
    <div class="modal fade" id="modalCierre" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-stop me-2"></i>
              Cierre de Turno
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="cierreForm" (ngSubmit)="cerrarTurno()">
            <div class="modal-body">
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Atención:</strong> Esta acción cerrará el turno actual y no se podrá deshacer.
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Total Efectivo *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="totalEfectivo"
                        step="0.01"
                        min="0"
                        required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Total Prepago *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="totalPrepago"
                        step="0.01"
                        min="0"
                        required>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Total Exentos *</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="totalExentos"
                        step="0.01"
                        min="0"
                        required>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Diferencia de Caja</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        [value]="calcularDiferenciaCaja()"
                        readonly>
                    </div>
                    <small class="form-text" [ngClass]="getDiferenciaClass()">
                      {{ getDiferenciaTexto() }}
                    </small>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">Observaciones de Cierre</label>
                    <textarea 
                      class="form-control" 
                      formControlName="observaciones"
                      rows="3"
                      placeholder="Observaciones del cierre de turno..."></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-danger"
                [disabled]="cierreForm.invalid || procesando">
                <i class="fas fa-stop me-2"></i>
                {{ procesando ? 'Cerrando...' : 'Cerrar Turno' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blink {
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    .form-label {
      font-weight: 500;
    }
    
    .modal-header {
      border-bottom: none;
    }
    
    .modal-footer {
      border-top: none;
    }
  `]
})
export class TurnoOperacionesComponent implements OnInit {
  
  aperturaForm!: FormGroup;
  cierreForm!: FormGroup;
  turnoActivo: Turno | null = null;
  turnosRecientes: Turno[] = [];
  templates: any[] = [];
  empleados: any[] = [];
  estaciones: any[] = [];
  procesando = false;

  constructor(
    private fb: FormBuilder,
    private turnosService: TurnosService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadTurnoActivo();
    this.loadTurnosRecientes();
    this.loadCatalogos();
  }

  private initializeForms() {
    this.aperturaForm = this.fb.group({
      turnoTemplateId: ['', [Validators.required]],
      empleadoId: ['', [Validators.required]],
      estacionId: ['', [Validators.required]],
      montoInicialCaja: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });

    this.cierreForm = this.fb.group({
      totalEfectivo: [0, [Validators.required, Validators.min(0)]],
      totalPrepago: [0, [Validators.required, Validators.min(0)]],
      totalExentos: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  loadTurnoActivo() {
    this.turnosService.getTurnosActivos().subscribe({
      next: (turnos: Turno[]) => {
        this.turnoActivo = turnos.find((t: Turno) => t.estado === TurnoEstado.EnCurso) || null;
      },
      error: (error: any) => {
        console.error('Error al cargar turno activo:', error);
        // Si hay error, mantenemos el componente funcional sin datos
        this.turnoActivo = null;
      }
    });
  }

  loadTurnosRecientes() {
    // Cargar turnos recientes desde el backend
    this.turnosService.getAll().subscribe({
      next: (response: any) => {
        // Asumiendo que getAll devuelve PaginatedResponse<Turno>
        this.turnosRecientes = response.data ? response.data.slice(0, 10) : [];
      },
      error: (error: any) => {
        console.error('Error al cargar turnos recientes:', error);
        // Si hay error, usar datos mock para mantener la funcionalidad
        this.loadMockTurnos();
      }
    });
  }

  private loadMockTurnos() {
    // Datos mock como fallback
    this.turnosRecientes = [
      {
        id: 1,
        empleadoId: 1,
        estacionId: 1,
        turnoTemplateId: 1,
        fechaTurno: new Date(),
        fechaCreacion: new Date(),
        estado: TurnoEstado.Finalizado,
        totalRecaudado: 1250.50,
        duracionReal: 8,
        horaInicio: new Date(Date.now() - 8 * 60 * 60 * 1000),
        horaFin: new Date(),
        empleado: { id: 1, nombre: 'Juan Pérez' },
        estacion: { id: 1, nombre: 'Estación Norte' }
      } as Turno
    ];
  }

  loadCatalogos() {
    // Aquí cargarías los catálogos desde los servicios correspondientes
    // Por ahora datos mock
    this.templates = [
      { id: 1, nombre: 'Turno Mañana', horaInicio: '06:00', horaFin: '14:00' },
      { id: 2, nombre: 'Turno Tarde', horaInicio: '14:00', horaFin: '22:00' },
      { id: 3, nombre: 'Turno Noche', horaInicio: '22:00', horaFin: '06:00' }
    ];

    this.empleados = [
      { id: 1, nombre: 'Juan Pérez', codigo: 'EMP001' },
      { id: 2, nombre: 'María García', codigo: 'EMP002' },
      { id: 3, nombre: 'Carlos López', codigo: 'EMP003' }
    ];

    this.estaciones = [
      { id: 1, nombre: 'Estación Norte', ubicacion: 'Carril 1-2' },
      { id: 2, nombre: 'Estación Sur', ubicacion: 'Carril 3-4' },
      { id: 3, nombre: 'Estación Centro', ubicacion: 'Carril 5-6' }
    ];
  }

  abrirModalApertura() {
    // Usar Bootstrap modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalApertura'));
    modal.show();
  }

  abrirModalCierre() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalCierre'));
    modal.show();
  }

  abrirTurno() {
    if (this.aperturaForm.valid && !this.procesando) {
      this.procesando = true;
      
      const turnoData: CreateTurnoDto = {
        turnoTemplateId: this.aperturaForm.value.turnoTemplateId,
        empleadoId: this.aperturaForm.value.empleadoId,
        estacionId: this.aperturaForm.value.estacionId,
        fechaTurno: new Date(),
        observaciones: this.aperturaForm.value.observaciones
      };

      this.turnosService.createTurno(turnoData).subscribe({
        next: (turno: Turno) => {
          this.turnoActivo = turno;
          this.procesando = false;
          this.aperturaForm.reset();
          // Cerrar modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalApertura'));
          modal?.hide();
          alert('Turno abierto exitosamente');
        },
        error: (error: any) => {
          console.error('Error al abrir turno:', error);
          this.procesando = false;
          alert('Error al abrir el turno. Intente nuevamente.');
        }
      });
    }
  }

  cerrarTurno() {
    if (this.cierreForm.valid && !this.procesando && this.turnoActivo) {
      this.procesando = true;
      
      const cierreData: FinalizarTurnoDto = {
        observaciones: this.cierreForm.value.observaciones,
        montoFinalCaja: this.cierreForm.value.totalEfectivo
      };

      this.turnosService.finalizarTurno(this.turnoActivo.id, cierreData).subscribe({
        next: (turno: Turno) => {
          this.turnoActivo = null;
          this.procesando = false;
          this.cierreForm.reset();
          this.loadTurnosRecientes();
          // Cerrar modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalCierre'));
          modal?.hide();
          alert('Turno cerrado exitosamente');
        },
        error: (error: any) => {
          console.error('Error al cerrar turno:', error);
          this.procesando = false;
          alert('Error al cerrar el turno. Intente nuevamente.');
        }
      });
    }
  }

  getDuracionTurno(turno: Turno): string {
    if (!turno.horaInicio) return 'N/A';
    
    const inicio = new Date(turno.horaInicio);
    const fin = turno.horaFin ? new Date(turno.horaFin) : new Date();
    const diferencia = fin.getTime() - inicio.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }

  getEstadoBadgeClass(estado: TurnoEstado): string {
    switch (estado) {
      case TurnoEstado.EnCurso: return 'bg-success';
      case TurnoEstado.Finalizado: return 'bg-primary';
      case TurnoEstado.Cancelado: return 'bg-danger';
      case TurnoEstado.Programado: return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  calcularDiferenciaCaja(): number {
    if (!this.cierreForm || !this.turnoActivo) return 0;
    
    const totalContado = 
      (this.cierreForm.value.totalEfectivo || 0) +
      (this.cierreForm.value.totalPrepago || 0) +
      (this.cierreForm.value.totalExentos || 0);
    
    const totalEsperado = this.turnoActivo.totalRecaudado || 0;
    
    return totalContado - totalEsperado;
  }

  getDiferenciaClass(): string {
    const diferencia = this.calcularDiferenciaCaja();
    if (diferencia > 0) return 'text-success';
    if (diferencia < 0) return 'text-danger';
    return 'text-muted';
  }

  getDiferenciaTexto(): string {
    const diferencia = this.calcularDiferenciaCaja();
    if (diferencia > 0) return 'Sobrante en caja';
    if (diferencia < 0) return 'Faltante en caja';
    return 'Caja cuadrada';
  }

  verDetalleTurno(turno: Turno) {
    // Implementar vista de detalle
    console.log('Ver detalle de turno:', turno);
  }

  imprimirReporte(turno: Turno) {
    // Implementar impresión de reporte
    console.log('Imprimir reporte de turno:', turno);
  }
}
