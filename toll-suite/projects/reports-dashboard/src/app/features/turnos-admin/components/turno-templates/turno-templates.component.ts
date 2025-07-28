import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TurnoTemplate {
  id: number;
  nombre: string;
  descripcion: string;
  horarioInicio: string;
  horarioFin: string;
  montoInicial: number;
  esActivo: boolean;
  duracionHoras: number;
}

@Component({
  selector: 'app-turno-templates',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i class="fas fa-clipboard-list me-2"></i>
              Plantillas de Turnos
            </h2>
            <button class="btn btn-primary" (click)="abrirModalCrear()">
              <i class="fas fa-plus me-2"></i>
              Nueva Plantilla
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de Plantillas -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Plantillas Existentes</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Horario</th>
                      <th>Duración</th>
                      <th>Monto Inicial</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let template of templates">
                      <td>
                        <strong>{{ template.nombre }}</strong>
                        <br>
                        <small class="text-muted">{{ template.descripcion }}</small>
                      </td>
                      <td>
                        <i class="fas fa-clock me-1"></i>
                        {{ template.horarioInicio }} - {{ template.horarioFin }}
                      </td>
                      <td>
                        <span class="badge bg-info">
                          {{ template.duracionHoras }}h
                        </span>
                      </td>
                      <td>
                        <i class="fas fa-dollar-sign me-1"></i>
                        {{ template.montoInicial | number:'1.2-2' }}
                      </td>
                      <td>
                        <span class="badge" [ngClass]="template.esActivo ? 'bg-success' : 'bg-secondary'">
                          {{ template.esActivo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="editarTemplate(template)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-outline-warning" (click)="toggleEstado(template)">
                            <i class="fas" [ngClass]="template.esActivo ? 'fa-pause' : 'fa-play'"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="eliminarTemplate(template)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div *ngIf="templates.length === 0" class="text-center py-4">
                  <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay plantillas</h5>
                  <p class="text-muted">Crea tu primera plantilla de turno</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div class="modal fade" id="templateModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ modoEdicion ? 'Editar' : 'Crear' }} Plantilla
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form [formGroup]="templateForm" (ngSubmit)="guardarTemplate()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nombre *</label>
                  <input type="text" class="form-control" formControlName="nombre" placeholder="Ej: Turno Mañana">
                  <div class="invalid-feedback" *ngIf="templateForm.get('nombre')?.invalid && templateForm.get('nombre')?.touched">
                    El nombre es requerido
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" formControlName="descripcion" rows="3" placeholder="Descripción del turno"></textarea>
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Horario Inicio *</label>
                      <input type="time" class="form-control" formControlName="horarioInicio">
                      <div class="invalid-feedback" *ngIf="templateForm.get('horarioInicio')?.invalid && templateForm.get('horarioInicio')?.touched">
                        El horario de inicio es requerido
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Horario Fin *</label>
                      <input type="time" class="form-control" formControlName="horarioFin">
                      <div class="invalid-feedback" *ngIf="templateForm.get('horarioFin')?.invalid && templateForm.get('horarioFin')?.touched">
                        El horario de fin es requerido
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Monto Inicial *</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" formControlName="montoInicial" placeholder="0.00" step="0.01">
                  </div>
                  <div class="invalid-feedback" *ngIf="templateForm.get('montoInicial')?.invalid && templateForm.get('montoInicial')?.touched">
                    El monto inicial es requerido
                  </div>
                </div>
                
                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="esActivo" id="esActivo">
                    <label class="form-check-label" for="esActivo">
                      Plantilla activa
                    </label>
                  </div>
                </div>
                
                <div class="alert alert-info" *ngIf="duracionCalculada">
                  <i class="fas fa-info-circle me-2"></i>
                  Duración calculada: {{ duracionCalculada }} horas
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="templateForm.invalid">
                  {{ modoEdicion ? 'Actualizar' : 'Crear' }}
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
    
    .invalid-feedback {
      display: block;
    }
  `]
})
export class TurnoTemplatesComponent implements OnInit {
  
  templates: TurnoTemplate[] = [];
  templateForm: FormGroup;
  modoEdicion = false;
  templateEnEdicion: TurnoTemplate | null = null;
  duracionCalculada: number | null = null;

  constructor(private fb: FormBuilder) {
    this.templateForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      horarioInicio: ['', Validators.required],
      horarioFin: ['', Validators.required],
      montoInicial: [0, [Validators.required, Validators.min(0)]],
      esActivo: [true]
    });
    
    this.loadMockData();
  }

  ngOnInit() {
    // Calcular duración cuando cambien los horarios
    this.templateForm.get('horarioInicio')?.valueChanges.subscribe(() => this.calcularDuracion());
    this.templateForm.get('horarioFin')?.valueChanges.subscribe(() => this.calcularDuracion());
  }

  private loadMockData() {
    this.templates = [
      {
        id: 1,
        nombre: 'Turno Mañana',
        descripcion: 'Turno matutino estándar',
        horarioInicio: '06:00',
        horarioFin: '14:00',
        montoInicial: 500,
        esActivo: true,
        duracionHoras: 8
      },
      {
        id: 2,
        nombre: 'Turno Tarde',
        descripcion: 'Turno vespertino estándar',
        horarioInicio: '14:00',
        horarioFin: '22:00',
        montoInicial: 300,
        esActivo: true,
        duracionHoras: 8
      },
      {
        id: 3,
        nombre: 'Turno Noche',
        descripcion: 'Turno nocturno',
        horarioInicio: '22:00',
        horarioFin: '06:00',
        montoInicial: 200,
        esActivo: false,
        duracionHoras: 8
      }
    ];
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.templateEnEdicion = null;
    this.templateForm.reset({
      nombre: '',
      descripcion: '',
      horarioInicio: '',
      horarioFin: '',
      montoInicial: 0,
      esActivo: true
    });
    // Abrir modal usando Bootstrap
    const modal = document.getElementById('templateModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  editarTemplate(template: TurnoTemplate) {
    this.modoEdicion = true;
    this.templateEnEdicion = template;
    this.templateForm.patchValue(template);
    this.calcularDuracion();
    
    const modal = document.getElementById('templateModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  guardarTemplate() {
    if (this.templateForm.invalid) return;

    const formData = this.templateForm.value;
    formData.duracionHoras = this.duracionCalculada || 0;

    if (this.modoEdicion && this.templateEnEdicion) {
      // Actualizar template existente
      const index = this.templates.findIndex(t => t.id === this.templateEnEdicion!.id);
      if (index !== -1) {
        this.templates[index] = { ...this.templateEnEdicion, ...formData };
      }
    } else {
      // Crear nuevo template
      const nuevoTemplate: TurnoTemplate = {
        id: Date.now(), // ID temporal
        ...formData
      };
      this.templates.push(nuevoTemplate);
    }

    // Cerrar modal
    const modal = document.getElementById('templateModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      bsModal?.hide();
    }
  }

  toggleEstado(template: TurnoTemplate) {
    template.esActivo = !template.esActivo;
  }

  eliminarTemplate(template: TurnoTemplate) {
    if (confirm(`¿Estás seguro de eliminar la plantilla "${template.nombre}"?`)) {
      const index = this.templates.findIndex(t => t.id === template.id);
      if (index !== -1) {
        this.templates.splice(index, 1);
      }
    }
  }

  private calcularDuracion() {
    const inicio = this.templateForm.get('horarioInicio')?.value;
    const fin = this.templateForm.get('horarioFin')?.value;
    
    if (inicio && fin) {
      const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
      const [horaFin, minutoFin] = fin.split(':').map(Number);
      
      let minutosInicio = horaInicio * 60 + minutoInicio;
      let minutosFin = horaFin * 60 + minutoFin;
      
      // Si el turno cruza medianoche
      if (minutosFin <= minutosInicio) {
        minutosFin += 24 * 60;
      }
      
      const diferencia = minutosFin - minutosInicio;
      this.duracionCalculada = diferencia / 60;
    } else {
      this.duracionCalculada = null;
    }
  }
}