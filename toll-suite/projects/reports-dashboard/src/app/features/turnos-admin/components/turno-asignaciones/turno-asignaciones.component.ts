import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TurnoAsignacion {
  id: number;
  empleadoId: number;
  turnoTemplateId: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'PROGRAMADO' | 'ACTIVO' | 'COMPLETADO' | 'CANCELADO';
  empleado?: any;
  turnoTemplate?: any;
}

@Component({
  selector: 'app-turno-asignaciones',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i class="fas fa-calendar-alt me-2"></i>
              Asignaciones de Turnos
            </h2>
            <button class="btn btn-primary" (click)="abrirModalAsignar()">
              <i class="fas fa-plus me-2"></i>
              Nueva Asignación
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label class="form-label">Fecha Desde:</label>
                  <input type="date" class="form-control" [(ngModel)]="filtros.fechaDesde" (change)="aplicarFiltros()">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Fecha Hasta:</label>
                  <input type="date" class="form-control" [(ngModel)]="filtros.fechaHasta" (change)="aplicarFiltros()">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Estado:</label>
                  <select class="form-select" [(ngModel)]="filtros.estado" (change)="aplicarFiltros()">
                    <option value="">Todos los estados</option>
                    <option value="PROGRAMADO">Programado</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Empleado:</label>
                  <select class="form-select" [(ngModel)]="filtros.empleadoId" (change)="aplicarFiltros()">
                    <option value="">Todos los empleados</option>
                    <option *ngFor="let empleado of empleados" [value]="empleado.id">
                      {{ empleado.nombre }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Asignaciones -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Asignaciones Programadas</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Turno</th>
                      <th>Fecha y Horario</th>
                      <th>Duración</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let asignacion of asignacionesFiltradas">
                      <td>
                        <strong>{{ asignacion.empleado?.nombre }}</strong>
                        <br>
                        <small class="text-muted">ID: {{ asignacion.empleadoId }}</small>
                      </td>
                      <td>
                        <strong>{{ asignacion.turnoTemplate?.nombre }}</strong>
                        <br>
                        <small class="text-muted">{{ asignacion.turnoTemplate?.descripcion }}</small>
                      </td>
                      <td>
                        <i class="fas fa-calendar me-1"></i>
                        {{ asignacion.fechaInicio | date:'dd/MM/yyyy' }}
                        <br>
                        <i class="fas fa-clock me-1"></i>
                        {{ asignacion.turnoTemplate?.horarioInicio }} - {{ asignacion.turnoTemplate?.horarioFin }}
                      </td>
                      <td>
                        <span class="badge bg-info">
                          {{ asignacion.turnoTemplate?.duracionHoras }}h
                        </span>
                      </td>
                      <td>
                        <span class="badge" [class]="getEstadoBadgeClass(asignacion.estado)">
                          {{ asignacion.estado }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary" 
                            (click)="editarAsignacion(asignacion)"
                            [disabled]="asignacion.estado === 'COMPLETADO'">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            class="btn btn-outline-warning" 
                            (click)="cambiarEstado(asignacion)"
                            *ngIf="asignacion.estado === 'PROGRAMADO'">
                            <i class="fas fa-play"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            (click)="cancelarAsignacion(asignacion)"
                            [disabled]="asignacion.estado === 'COMPLETADO'">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div *ngIf="asignacionesFiltradas.length === 0" class="text-center py-4">
                  <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay asignaciones</h5>
                  <p class="text-muted">No se encontraron asignaciones que coincidan con los filtros</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Asignar/Editar -->
      <div class="modal fade" id="asignacionModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ modoEdicion ? 'Editar' : 'Nueva' }} Asignación
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form [formGroup]="asignacionForm" (ngSubmit)="guardarAsignacion()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Empleado *</label>
                  <select class="form-select" formControlName="empleadoId">
                    <option value="">Selecciona un empleado</option>
                    <option *ngFor="let empleado of empleados" [value]="empleado.id">
                      {{ empleado.nombre }}
                    </option>
                  </select>
                  <div class="text-danger" *ngIf="asignacionForm.get('empleadoId')?.invalid && asignacionForm.get('empleadoId')?.touched">
                    El empleado es requerido
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Plantilla de Turno *</label>
                  <select class="form-select" formControlName="turnoTemplateId">
                    <option value="">Selecciona una plantilla</option>
                    <option *ngFor="let template of turnoTemplates" [value]="template.id">
                      {{ template.nombre }} ({{ template.horarioInicio }} - {{ template.horarioFin }})
                    </option>
                  </select>
                  <div class="text-danger" *ngIf="asignacionForm.get('turnoTemplateId')?.invalid && asignacionForm.get('turnoTemplateId')?.touched">
                    La plantilla es requerida
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Fecha de Inicio *</label>
                  <input type="date" class="form-control" formControlName="fechaInicio">
                  <div class="text-danger" *ngIf="asignacionForm.get('fechaInicio')?.invalid && asignacionForm.get('fechaInicio')?.touched">
                    La fecha de inicio es requerida
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Fecha de Fin *</label>
                  <input type="date" class="form-control" formControlName="fechaFin">
                  <div class="text-danger" *ngIf="asignacionForm.get('fechaFin')?.invalid && asignacionForm.get('fechaFin')?.touched">
                    La fecha de fin es requerida
                  </div>
                </div>
                
                <div class="alert alert-info" *ngIf="plantillaSeleccionada">
                  <strong>Detalles del Turno:</strong><br>
                  <i class="fas fa-clock me-1"></i> {{ plantillaSeleccionada.horarioInicio }} - {{ plantillaSeleccionada.horarioFin }}<br>
                  <i class="fas fa-hourglass-half me-1"></i> {{ plantillaSeleccionada.duracionHoras }} horas<br>
                  <i class="fas fa-dollar-sign me-1"></i> Monto inicial: {{ plantillaSeleccionada.montoInicial }}
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="asignacionForm.invalid">
                  {{ modoEdicion ? 'Actualizar' : 'Asignar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .table td {
      vertical-align: middle;
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class TurnoAsignacionesComponent implements OnInit {
  
  asignaciones: TurnoAsignacion[] = [];
  asignacionesFiltradas: TurnoAsignacion[] = [];
  empleados: any[] = [];
  turnoTemplates: any[] = [];
  asignacionForm: FormGroup;
  modoEdicion = false;
  asignacionEnEdicion: TurnoAsignacion | null = null;
  plantillaSeleccionada: any = null;
  
  filtros = {
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    empleadoId: ''
  };

  constructor(private fb: FormBuilder) {
    this.asignacionForm = this.fb.group({
      empleadoId: ['', Validators.required],
      turnoTemplateId: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
    
    this.loadMockData();
  }

  ngOnInit() {
    this.aplicarFiltros();
    
    // Actualizar plantilla seleccionada cuando cambie
    this.asignacionForm.get('turnoTemplateId')?.valueChanges.subscribe(templateId => {
      this.plantillaSeleccionada = this.turnoTemplates.find(t => t.id == templateId) || null;
    });
  }

  private loadMockData() {
    this.empleados = [
      { id: 1, nombre: 'Juan Pérez' },
      { id: 2, nombre: 'María García' },
      { id: 3, nombre: 'Carlos López' },
      { id: 4, nombre: 'Ana Martínez' }
    ];

    this.turnoTemplates = [
      {
        id: 1,
        nombre: 'Turno Mañana',
        descripcion: 'Turno matutino estándar',
        horarioInicio: '06:00',
        horarioFin: '14:00',
        duracionHoras: 8,
        montoInicial: 500
      },
      {
        id: 2,
        nombre: 'Turno Tarde',
        descripcion: 'Turno vespertino estándar',
        horarioInicio: '14:00',
        horarioFin: '22:00',
        duracionHoras: 8,
        montoInicial: 300
      }
    ];

    // Asignaciones mock
    this.asignaciones = [
      {
        id: 1,
        empleadoId: 1,
        turnoTemplateId: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estado: 'ACTIVO',
        empleado: this.empleados[0],
        turnoTemplate: this.turnoTemplates[0]
      },
      {
        id: 2,
        empleadoId: 2,
        turnoTemplateId: 2,
        fechaInicio: new Date(Date.now() + 24 * 60 * 60 * 1000),
        fechaFin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estado: 'PROGRAMADO',
        empleado: this.empleados[1],
        turnoTemplate: this.turnoTemplates[1]
      }
    ];
  }

  aplicarFiltros() {
    this.asignacionesFiltradas = this.asignaciones.filter(asignacion => {
      let cumpleFiltros = true;

      if (this.filtros.estado && asignacion.estado !== this.filtros.estado) {
        cumpleFiltros = false;
      }

      if (this.filtros.empleadoId && asignacion.empleadoId.toString() !== this.filtros.empleadoId) {
        cumpleFiltros = false;
      }

      if (this.filtros.fechaDesde) {
        const fechaDesde = new Date(this.filtros.fechaDesde);
        if (asignacion.fechaInicio < fechaDesde) {
          cumpleFiltros = false;
        }
      }

      if (this.filtros.fechaHasta) {
        const fechaHasta = new Date(this.filtros.fechaHasta);
        if (asignacion.fechaInicio > fechaHasta) {
          cumpleFiltros = false;
        }
      }

      return cumpleFiltros;
    });
  }

  abrirModalAsignar() {
    this.modoEdicion = false;
    this.asignacionEnEdicion = null;
    this.asignacionForm.reset();
    this.plantillaSeleccionada = null;
    
    const modal = document.getElementById('asignacionModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  editarAsignacion(asignacion: TurnoAsignacion) {
    this.modoEdicion = true;
    this.asignacionEnEdicion = asignacion;
    
    this.asignacionForm.patchValue({
      empleadoId: asignacion.empleadoId,
      turnoTemplateId: asignacion.turnoTemplateId,
      fechaInicio: asignacion.fechaInicio.toISOString().split('T')[0],
      fechaFin: asignacion.fechaFin.toISOString().split('T')[0]
    });
    
    const modal = document.getElementById('asignacionModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  guardarAsignacion() {
    if (this.asignacionForm.invalid) return;

    const formData = this.asignacionForm.value;
    const empleado = this.empleados.find(e => e.id == formData.empleadoId);
    const template = this.turnoTemplates.find(t => t.id == formData.turnoTemplateId);

    if (this.modoEdicion && this.asignacionEnEdicion) {
      // Actualizar asignación existente
      const index = this.asignaciones.findIndex(a => a.id === this.asignacionEnEdicion!.id);
      if (index !== -1) {
        this.asignaciones[index] = {
          ...this.asignacionEnEdicion,
          ...formData,
          fechaInicio: new Date(formData.fechaInicio),
          fechaFin: new Date(formData.fechaFin),
          empleado,
          turnoTemplate: template
        };
      }
    } else {
      // Crear nueva asignación
      const nuevaAsignacion: TurnoAsignacion = {
        id: Date.now(),
        ...formData,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
        estado: 'PROGRAMADO',
        empleado,
        turnoTemplate: template
      };
      this.asignaciones.push(nuevaAsignacion);
    }

    this.aplicarFiltros();
    
    // Cerrar modal
    const modal = document.getElementById('asignacionModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      bsModal?.hide();
    }
  }

  cambiarEstado(asignacion: TurnoAsignacion) {
    if (asignacion.estado === 'PROGRAMADO') {
      asignacion.estado = 'ACTIVO';
    }
    this.aplicarFiltros();
  }

  cancelarAsignacion(asignacion: TurnoAsignacion) {
    if (confirm('¿Estás seguro de cancelar esta asignación?')) {
      asignacion.estado = 'CANCELADO';
      this.aplicarFiltros();
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO': return 'bg-warning';
      case 'ACTIVO': return 'bg-success';
      case 'COMPLETADO': return 'bg-primary';
      case 'CANCELADO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}